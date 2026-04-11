"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

// ── Grade options for scenario planner ───────────────────────
const GRADE_OPTIONS: Record<string, string[]> = {
  "a-level": ["A*", "A", "B", "C", "D", "E"],
  "as-level": ["A", "B", "C", "D", "E"],
  "btec": ["D*D*D*", "D*D*D", "D*DD", "DDD", "DDM", "DMM", "MMM", "MMP", "MPP", "PPP"],
  "cambridge-technical": ["D*D*D*", "D*D*D", "D*DD", "DDD", "DDM", "DMM", "MMM", "MMP", "MPP", "PPP"],
  "t-level": ["A*", "A", "B", "C", "D", "E"],
  "epq": ["A*", "A", "B", "C", "D", "E"],
  "core-maths": ["A", "B", "C", "D", "E"],
  "welsh-bacc": ["A*", "A", "B", "C", "D", "E"],
  "scottish-higher": ["A", "B", "C", "D"],
  "scottish-advanced-higher": ["A", "B", "C", "D"],
  "cambridge-pre-u": ["D1", "D2", "D3", "M1", "M2", "M3", "P1", "P2", "P3"],
  "cambridge-pre-u-gpr": ["D1", "D2", "D3", "M1", "M2", "M3", "P1", "P2", "P3"],
  "ib-diploma": ["45","44","43","42","41","40","39","38","37","36","35","34","33","32","31","30","29","28","27","26","25","24"],
  "ib-subject-hl": ["7", "6", "5", "4", "3"],
  "ib-subject-sl": ["7", "6", "5", "4", "3"],
  "music-grade": ["Distinction", "Merit", "Pass"],
  "access-to-he": ["Distinction", "Merit", "Pass"],
};

// ── Types ─────────────────────────────────────────────────────
type QualType = string;

type ResolvedQualification = {
  type: QualType;
  grade: string;
  subject?: string;
  size?: string;
  music_grade_number?: number;
  ib_score?: number;
  raw: string;
  confidence: "high" | "medium" | "low";
  needs_clarification?: string;
  points: number;
  display_name: string;
  tariff_entry_id: string;
  lookup_status: "found" | "not_in_tariff" | "ambiguous" | "error";
  lookup_note?: string;
  excluded?: boolean;
  excluded_reason?: string;
};

type TariffResult = {
  qualifications: ResolvedQualification[];
  total_points: number;
  rules_applied: { rule_key: string; affected_quals: string[]; points_removed: number; explanation: string }[];
  warnings: string[];
  context: {
    summary: string;
    tier_label: string;
    tier_description: string;
    quick_wins: { title: string; description: string; points_gain: number }[];
  };
  generated_at: string;
};

// ── Helpers ───────────────────────────────────────────────────
function toParsedQualification(value: unknown): ResolvedQualification | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.type !== "string" || typeof row.raw !== "string") return null;
  return {
    type: row.type,
    grade: typeof row.grade === "string" ? row.grade : "",
    subject: typeof row.subject === "string" ? row.subject : undefined,
    size: typeof row.size === "string" ? row.size : undefined,
    music_grade_number: typeof row.music_grade_number === "number" ? row.music_grade_number : undefined,
    ib_score: typeof row.ib_score === "number" ? row.ib_score : undefined,
    raw: row.raw,
    confidence:
      row.confidence === "high" || row.confidence === "medium" || row.confidence === "low"
        ? row.confidence
        : "low",
    needs_clarification:
      typeof row.needs_clarification === "string" ? row.needs_clarification : undefined,
    points: typeof row.points === "number" ? row.points : 0,
    display_name: typeof row.display_name === "string" ? row.display_name : "",
    tariff_entry_id: typeof row.tariff_entry_id === "string" ? row.tariff_entry_id : "",
    lookup_status:
      row.lookup_status === "found" ||
      row.lookup_status === "not_in_tariff" ||
      row.lookup_status === "ambiguous"
        ? row.lookup_status
        : "error",
    lookup_note: typeof row.lookup_note === "string" ? row.lookup_note : undefined,
  };
}

function formatType(type: string): string {
  const labels: Record<string, string> = {
    "a-level": "A Level",
    "as-level": "AS Level",
    epq: "EPQ",
    "core-maths": "Core Maths",
    btec: "BTEC",
    "cambridge-technical": "Cambridge Technical",
    "t-level": "T Level",
    "ib-diploma": "IB Diploma",
    "ib-subject-hl": "IB Higher Level",
    "ib-subject-sl": "IB Standard Level",
    "scottish-higher": "Scottish Higher",
    "scottish-advanced-higher": "Scottish Advanced Higher",
    "cambridge-pre-u": "Cambridge Pre-U",
    "cambridge-pre-u-gpr": "Cambridge Pre-U GPR",
    "music-grade": "Music Grade",
    "welsh-bacc": "Welsh Baccalaureate",
    "access-to-he": "Access to HE",
    other: "Other",
  };
  return labels[type] ?? type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Component ─────────────────────────────────────────────────
export default function Home() {
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TariffResult | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [scenarioMode, setScenarioMode] = useState(false);
  const [scenarioGrades, setScenarioGrades] = useState<Record<number, string>>({});
  const [scenarioTotal, setScenarioTotal] = useState<number | null>(null);
  const [scenarioCalculating, setScenarioCalculating] = useState(false);
  const [scenarioQuals, setScenarioQuals] = useState<ResolvedQualification[] | null>(null);
  const [matchResults, setMatchResults] = useState<null | { name: string; city: string; course: string; min_points: number; typical_points: number; url: string; label: 'Likely' | 'Target' | 'Aspirational' }[]>(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [resolvingIndex, setResolvingIndex] = useState<number | null>(null);
  const cards = useMemo(() => result?.qualifications ?? [], [result]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const points = params.get('points');
    if (sessionId && points) {
      (async () => {
        try {
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.paid) {
            const matchRes = await fetch('/api/match', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ total_points: Number(points) }),
            });
            const matchData = await matchRes.json();
            setMatchResults(matchData);
          }
          window.history.replaceState({}, '', '/');
        } catch {
          // fail silently
        }
      })();
    }
  }, []);

  async function recalculateScenario(index: number, newGrade: string) {
    if (!result) return;
    const updated = { ...scenarioGrades, [index]: newGrade };
    setScenarioGrades(updated);

    const modifiedQuals = result.qualifications.map((q, i) =>
      updated[i] !== undefined ? { ...q, grade: updated[i] } : q
    );

    setScenarioCalculating(true);
    try {
      const res = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qualifications: modifiedQuals }),
      });
      if (res.ok) {
        const data = await res.json();
        setScenarioTotal(data.total_points);
        setScenarioQuals(data.qualifications);
      }
    } catch {
      // fail silently
    } finally {
      setScenarioCalculating(false);
    }
  }

  async function handleUnlockMatch() {
    setMatchLoading(true);
    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ total_points: result?.total_points }),
    });
    const { url } = await res.json();
    window.location.href = url;
  }

  async function handleEmailSubmit() {
    if (!emailInput.includes("@")) return;
    setEmailSubmitting(true);
    try {
      await fetch("/api/capture-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput,
          total_points: result?.total_points,
          tier_label: result?.context?.tier_label,
          tier_description: result?.context?.tier_description,
          quick_wins: result?.context?.quick_wins ?? [],
        }),
      });
      setEmailSubmitted(true);
    } catch {
      // fail silently
    } finally {
      setEmailSubmitting(false);
    }
  }

  async function handleResolveAmbiguous(index: number, grade: string) {
    if (!result || !grade) return;
    setResolvingIndex(index);
    const updatedQuals = result.qualifications.map((q, i) =>
      i === index ? { ...q, grade } : q
    );
    try {
      const res = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qualifications: updatedQuals }),
      });
      if (res.ok) {
        const data = await res.json();
        if (!data.context && result.context) data.context = result.context;
        setResult(data);
      }
    } catch {
      // fail silently
    } finally {
      setResolvingIndex(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const parseResponse = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      const parseData: unknown = await parseResponse.json();

      if (!parseResponse.ok) {
        const message =
          parseData && typeof parseData === "object" && "error" in parseData
            ? String((parseData as { error?: unknown }).error ?? "Request failed")
            : "Request failed";
        throw new Error(message);
      }

      const payload = Array.isArray(parseData)
        ? parseData
        : parseData &&
            typeof parseData === "object" &&
            Array.isArray((parseData as { parsed?: unknown }).parsed)
          ? (parseData as { parsed: unknown[] }).parsed
          : [];

      const parsed = payload
        .map(toParsedQualification)
        .filter((item): item is ResolvedQualification => item !== null);

      const calculateResponse = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qualifications: parsed }),
      });

      const calculateData: unknown = await calculateResponse.json();

      if (!calculateResponse.ok) {
        const message =
          calculateData && typeof calculateData === "object" && "error" in calculateData
            ? String((calculateData as { error?: unknown }).error ?? "Calculation failed")
            : "Calculation failed";
        throw new Error(message);
      }

      if (
        !calculateData ||
        typeof calculateData !== "object" ||
        !Array.isArray((calculateData as { qualifications?: unknown }).qualifications) ||
        typeof (calculateData as { total_points?: unknown }).total_points !== "number"
      ) {
        throw new Error("Invalid calculate response");
      }

      // Fetch AI context
      try {
        const contextResponse = await fetch("/api/context", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            total_points: (calculateData as TariffResult).total_points,
            qualifications: (calculateData as TariffResult).qualifications,
          }),
        });
        if (contextResponse.ok) {
          const contextData = await contextResponse.json();
          (calculateData as TariffResult).context = contextData;
        }
      } catch {
        // context is non-critical, fail silently
      }

      setResult(calculateData as TariffResult);
      setTimeout(() => setShowEmailModal(true), 1500);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fade-up 0.35s ease both;
        }
      `}</style>

      {/* ── Navbar ── */}
      <nav style={{ borderBottom: "1px solid #e8e6e0" }} className="bg-[#f5f3ee] px-4 py-4">
        <div className="mx-auto flex max-w-[680px] items-center gap-2.5">
          <div
            style={{ background: "#002FA7", borderRadius: "7px", width: 28, height: 28, flexShrink: 0 }}
            className="flex items-center justify-center"
          >
            <svg viewBox="0 0 64 64" width="18" height="18" fill="none">
              <path d="M12 50 L32 14 L52 50" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ color: "#1a1a2e", fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em", fontFamily: "'Churchward Roundsquare', sans-serif" }}>
            Gradestack
          </span>
        </div>
      </nav>

      <main style={{ background: "#f5f3ee", minHeight: "100vh" }} className="px-4 pb-24">

        {/* ── Hero ── */}
        <section className="mx-auto flex max-w-[680px] flex-col items-center pt-16 pb-12 text-center">
          <div
            style={{ background: "#e5eaf8", color: "#002FA7", border: "1px solid #7d9bd4", borderRadius: 999, padding: "5px 14px", fontSize: 12, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 20 }}
          >
            UCAS Tariff Calculator
          </div>
          <h1
            style={{ fontSize: "clamp(38px, 6vw, 56px)", fontWeight: 800, color: "#1a1a2e", letterSpacing: "-0.03em", lineHeight: 1.1 }}
          >
            Know your{" "}
            <span style={{ color: "#002FA7" }}>points.</span>
            <br />Own your future.
          </h1>
          <p style={{ fontSize: 17, color: "#6b6b80", marginTop: 16, lineHeight: 1.6 }}>
            Instantly calculate your UCAS tariff points and see where you stand.
          </p>
        </section>

        {/* ── Input card ── */}
        <section className="mx-auto max-w-[680px]">
          <form
            onSubmit={handleSubmit}
            style={{ background: "#ffffff", border: "1px solid #e8e6e0", borderRadius: 20, padding: "28px" }}
          >
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#1a1a2e", marginBottom: 10 }}>
              Your qualifications
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your qualifications in plain English — e.g. A* Maths, A Physics, B Chemistry, EPQ grade A"
              style={{
                width: "100%",
                minHeight: 180,
                background: "#f5f3ee",
                border: "1.5px solid #e8e6e0",
                borderRadius: 12,
                padding: "14px 16px",
                fontSize: 14,
                color: "#1a1a2e",
                lineHeight: 1.6,
                resize: "none",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.15s",
                fontFamily: "inherit",
              }}
              onFocus={e => (e.target.style.borderColor = "#002FA7")}
              onBlur={e => (e.target.style.borderColor = "#e8e6e0")}
            />

            <button
              type="submit"
              disabled={isSubmitting || !input.trim()}
              style={{
                marginTop: 12,
                width: "100%",
                background: "#002FA7",
                color: "#ffffff",
                border: "none",
                borderRadius: 12,
                padding: "14px",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "background 0.15s, transform 0.1s",
                opacity: isSubmitting || !input.trim() ? 0.45 : 1,
              }}
              onMouseEnter={e => { if (!isSubmitting && input.trim()) (e.currentTarget as HTMLButtonElement).style.background = "#001f85"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#002FA7"; }}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin" style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Calculating…
                </>
              ) : (
                "Calculate"
              )}
            </button>
          </form>

          {/* ── Error ── */}
          {error && (
            <div style={{ marginTop: 12, background: "#fff0f0", border: "1px solid #f09595", borderRadius: 12, padding: "12px 16px", fontSize: 14, color: "#a32d2d" }}>
              {error}
            </div>
          )}
        </section>

        {/* ── Results ── */}
        {result && (
          <section className="animate-fade-up mx-auto mt-8 max-w-[680px]" style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Total block — full indigo card */}
            <div style={{ background: "#002FA7", borderRadius: 20, padding: "36px 28px", textAlign: "center" }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: 8 }}>
                Total UCAS Points
              </p>
              <p style={{ fontSize: 88, fontWeight: 800, color: "#ffffff", lineHeight: 1, tabularNums: true } as React.CSSProperties}>
                {result.total_points}
              </p>

              {scenarioMode && scenarioTotal !== null && (
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>Scenario Total</p>
                  <p style={{
                    fontSize: 44,
                    fontWeight: 800,
                    color: scenarioTotal > result.total_points ? "#86efac" : scenarioTotal < result.total_points ? "#fca5a5" : "#ffffff",
                    lineHeight: 1,
                  }}>
                    {scenarioCalculating ? "…" : scenarioTotal}
                    {!scenarioCalculating && scenarioTotal !== result.total_points && (
                      <span style={{ fontSize: 22, marginLeft: 8 }}>
                        {scenarioTotal > result.total_points ? `+${scenarioTotal - result.total_points}` : `${scenarioTotal - result.total_points}`}
                      </span>
                    )}
                  </p>
                </div>
              )}

              {result.context?.tier_label && (
                <div style={{ marginTop: 18, display: "flex", justifyContent: "center" }}>
                  <span style={{ background: "rgba(255,255,255,0.15)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 999, padding: "5px 14px", fontSize: 13, fontWeight: 500 }}>
                    {result.context.tier_label}
                  </span>
                </div>
              )}

              {result.context?.tier_description && (
                <p style={{ marginTop: 14, fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, maxWidth: 460, margin: "14px auto 0" }}>
                  {result.context.tier_description}
                </p>
              )}

              {result.context?.quick_wins && result.context.quick_wins.length > 0 && (
                <div style={{ marginTop: 24, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 20 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>Quick Wins</p>
                  {emailSubmitted ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {result.context.quick_wins.map((win, i) => (
                        <div key={i} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, textAlign: "left" }}>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "#ffffff", marginBottom: 3 }}>{win.title}</p>
                            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{win.description}</p>
                          </div>
                          {win.points_gain > 0 && (
                            <span style={{ flexShrink: 0, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 700, color: "#ffffff" }}>
                              +{win.points_gain} pts
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ position: "relative" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {result.context.quick_wins.map((win, i) => (
                          <div key={i} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, textAlign: "left", filter: "blur(5px)", userSelect: "none", pointerEvents: "none" }}>
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 600, color: "#ffffff", marginBottom: 3 }}>{win.title}</p>
                              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{win.description}</p>
                            </div>
                            {win.points_gain > 0 && (
                              <span style={{ flexShrink: 0, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 700, color: "#ffffff" }}>
                                +{win.points_gain} pts
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#ffffff" }}>Unlock your personalised quick wins</p>
                        <button
                          onClick={() => setShowEmailModal(true)}
                          style={{ background: "#ffffff", color: "#002FA7", border: "none", borderRadius: 12, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                        >
                          Get full results by email
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {result.warnings && result.warnings.length > 0 && (
                <ul style={{ marginTop: 20, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                  {result.warnings.map((w, i) => (
                    <li key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", listStyle: "none" }}>
                      {w}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Qualification cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {cards.map((q, i) => {
                const excluded = q.excluded;
                const found = q.lookup_status === "found" && !excluded;
                return (
                  <div
                    key={`${q.raw}-${i}`}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e8e6e0",
                      borderRadius: 14,
                      padding: "14px 18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                      opacity: excluded ? 0.4 : 1,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9b99b0", marginBottom: 3 }}>
                        {formatType(q.type)}
                      </p>
                      {scenarioMode && found ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 2 }}>
                          <select
                            value={scenarioGrades[i] ?? q.grade}
                            onChange={(e) => recalculateScenario(i, e.target.value)}
                            style={{
                              background: "#f5f3ee",
                              border: "1.5px solid #d4d0f0",
                              borderRadius: 8,
                              padding: "5px 10px",
                              fontSize: 13,
                              fontWeight: 500,
                              color: "#1a1a2e",
                              outline: "none",
                              cursor: "pointer",
                              fontFamily: "inherit",
                            }}
                            onFocus={e => (e.target.style.borderColor = "#002FA7")}
                            onBlur={e => (e.target.style.borderColor = "#d4d0f0")}
                          >
                            {(GRADE_OPTIONS[q.type] ?? [q.grade]).map((g) => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                          {scenarioGrades[i] && scenarioGrades[i] !== q.grade && (
                            <span style={{ fontSize: 12, color: "#9b99b0", textDecoration: "line-through" }}>{q.grade}</span>
                          )}
                        </div>
                      ) : (
                        <p style={{ fontSize: 14, fontWeight: 500, color: found ? "#1a1a2e" : "#9b99b0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {q.subject
                            ? `${q.subject}${q.grade ? ` — ${q.grade}` : ""}`
                            : q.display_name && q.grade
                              ? `${q.display_name} — ${q.grade}`
                              : q.display_name || q.grade || q.raw}
                        </p>
                      )}
                    </div>

                    <div style={{ flexShrink: 0 }}>
                      {excluded ? (
                        <span style={{ background: "#f5f3ee", border: "1px solid #e8e6e0", borderRadius: 8, padding: "4px 10px", fontSize: 13, fontWeight: 700, color: "#9b99b0", textDecoration: "line-through" }}>
                          {q.points} pts
                        </span>
                      ) : found ? (
                        (() => {
                          const displayPoints = scenarioMode && scenarioQuals ? (scenarioQuals[i]?.points ?? q.points) : q.points;
                          const pointsChanged = scenarioMode && scenarioQuals && scenarioQuals[i]?.points !== q.points;
                          const increased = pointsChanged && scenarioQuals![i].points > q.points;
                          const decreased = pointsChanged && scenarioQuals![i].points < q.points;
                          return (
                            <span style={{
                              background: increased ? "#eaf3de" : decreased ? "#fcebeb" : "#e5eaf8",
                              border: `1px solid ${increased ? "#c0dd97" : decreased ? "#f09595" : "#7d9bd4"}`,
                              borderRadius: 8,
                              padding: "4px 10px",
                              fontSize: 13,
                              fontWeight: 700,
                              color: increased ? "#3b6d11" : decreased ? "#a32d2d" : "#002FA7",
                              transition: "all 0.15s",
                            }}>
                              {displayPoints} pts
                            </span>
                          );
                        })()
                      ) : q.lookup_status === "ambiguous" ? (
                        <select
                          defaultValue=""
                          disabled={resolvingIndex === i}
                          onChange={(e) => handleResolveAmbiguous(i, e.target.value)}
                          style={{
                            background: "#faeeda",
                            border: "1.5px solid #fac775",
                            borderRadius: 8,
                            padding: "4px 10px",
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#854f0b",
                            cursor: "pointer",
                            outline: "none",
                            fontFamily: "inherit",
                          }}
                          onFocus={e => (e.target.style.borderColor = "#002FA7")}
                          onBlur={e => (e.target.style.borderColor = "#fac775")}
                        >
                          <option value="" disabled>Grade?</option>
                          {(GRADE_OPTIONS[q.type] ?? ["A*", "A", "B", "C", "D", "E"]).map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      ) : (
                        <span style={{ background: "#f5f3ee", border: "1px solid #e8e6e0", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 500, color: "#9b99b0" }}>
                          Not recognised
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </section>
        )}

        {/* University match — coming soon */}
        {result && !matchResults && (
          <div className="animate-fade-up mx-auto mt-3 max-w-[680px]">
            <div style={{background:'#ffffff', border:'1px solid #e8e6e0', borderRadius:20, padding:'40px 36px 32px', textAlign:'center', marginTop:12}}>
              <div style={{display:'inline-block', background:'#f0f0f5', border:'1px solid #d0cfe8', borderRadius:999, padding:'4px 14px', fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'#7b7a9a', marginBottom:20}}>Coming Soon</div>
              <p style={{fontSize:26, fontWeight:800, color:'#1a1a2e', letterSpacing:'-0.02em', lineHeight:1.2, marginBottom:12}}>Find out where {result.total_points} points takes you</p>
              <p style={{fontSize:15, color:'#6b6b80', lineHeight:1.65, maxWidth:380, margin:'0 auto 0'}}>We&apos;re building a university matching feature that will show you a personalised list of courses matched to your points — with likelihood ratings and direct links to apply.</p>
            </div>
          </div>
        )}

        {result && matchResults && matchResults.length > 0 && (
          <section className="animate-fade-up mx-auto mt-3 max-w-[680px]">
            <div style={{background:'#ffffff', border:'1px solid #e8e6e0', borderRadius:20, padding:'20px 24px', marginBottom:12}}>
              <p style={{fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'#9b99b0', marginBottom:4}}>University Match</p>
              <p style={{fontSize:18, fontWeight:800, color:'#1a1a2e'}}>{matchResults.length} courses matched to your points</p>
            </div>
            {(['Likely', 'Target', 'Aspirational'] as const).map((label) => {
              const group = matchResults.filter(r => r.label === label);
              if (!group.length) return null;
              return (
                <div key={label} style={{marginBottom:16}}>
                  <p style={{fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'#9b99b0', marginBottom:8, paddingLeft:4}}>{label}</p>
                  {group.map((r, i) => (
                    <a key={i} href={r.url} target="_blank" rel="noreferrer" style={{display:'block', background:'#ffffff', border:'1px solid #e8e6e0', borderRadius:14, padding:'14px 18px', marginBottom:8, textDecoration:'none'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                        <div>
                          <p style={{fontSize:10, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'#9b99b0', marginBottom:3}}>{r.name} · {r.city}</p>
                          <p style={{fontSize:14, fontWeight:500, color:'#1a1a2e'}}>{r.course}</p>
                        </div>
                        <span style={{
                          fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:8, whiteSpace:'nowrap',
                          background: r.label === 'Likely' ? '#eaf3de' : r.label === 'Target' ? '#e5eaf8' : '#faeeda',
                          color: r.label === 'Likely' ? '#3b6d11' : r.label === 'Target' ? '#002FA7' : '#854f0b',
                          border: r.label === 'Likely' ? '1px solid #c0dd97' : r.label === 'Target' ? '1px solid #7d9bd4' : '1px solid #fac775',
                        }}>{r.label} · {r.typical_points} pts</span>
                      </div>
                    </a>
                  ))}
                </div>
              );
            })}
          </section>
        )}

        {/* Scenario toggle */}
        {result && (
          <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
            <button
              onClick={() => {
                setScenarioMode(!scenarioMode);
                setScenarioGrades({});
                setScenarioTotal(null);
                setScenarioQuals(null);
              }}
              style={{
                background: scenarioMode ? "#e5eaf8" : "#ffffff",
                border: `1px solid ${scenarioMode ? "#7d9bd4" : "#e8e6e0"}`,
                borderRadius: 12,
                padding: "9px 18px",
                fontSize: 13,
                fontWeight: 600,
                color: scenarioMode ? "#002FA7" : "#6b6b80",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { if (!scenarioMode) { (e.currentTarget as HTMLButtonElement).style.borderColor = "#002FA7"; (e.currentTarget as HTMLButtonElement).style.color = "#002FA7"; } }}
              onMouseLeave={e => { if (!scenarioMode) { (e.currentTarget as HTMLButtonElement).style.borderColor = "#e8e6e0"; (e.currentTarget as HTMLButtonElement).style.color = "#6b6b80"; } }}
            >
              {scenarioMode ? "Exit scenario mode" : "Try a scenario"}
            </button>
          </div>
        )}
      </main>

      {/* ── Shortlisted banner ── */}
      <div style={{ background: "#fdf5f2", borderTop: "1px solid #f0e0d8", borderBottom: "1px solid #f0e0d8", padding: "16px" }}>
        <a
          href="/shortlisted"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 680, margin: "0 auto", textDecoration: "none", gap: 12 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#C24E2A", background: "#fce8e2", borderRadius: 6, padding: "2px 8px" }}>New</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>Get AI feedback on your personal statement</span>
            <span style={{ fontSize: 14, color: "#6b6b80", display: "none" }} className="sm:inline">— scored by an expert AI reviewer</span>
          </div>
          <span style={{ fontSize: 13, color: "#C24E2A", fontWeight: 600, whiteSpace: "nowrap" }}>Try Shortlisted →</span>
        </a>
      </div>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid #e8e6e0", background: "#f5f3ee", padding: "20px 16px", textAlign: "center" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <p style={{ fontSize: 12, color: "#9b99b0", margin: 0 }}>
            &copy; {new Date().getFullYear()} Gradestack &nbsp;&middot;&nbsp;{" "}
            <a href="/privacy" style={{ color: "#9b99b0", textDecoration: "none" }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#1a1a2e"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#9b99b0"; }}>
              Privacy Policy
            </a>
            {" "}&nbsp;&middot;&nbsp;{" "}
            <a href="/terms" style={{ color: "#9b99b0", textDecoration: "none" }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#1a1a2e"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#9b99b0"; }}>
              Terms &amp; Conditions
            </a>
          </p>
        </div>
      </footer>

      {/* ── Email modal ── */}
      {showEmailModal && !emailSubmitted && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px", background: "rgba(26,26,46,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="animate-fade-up" style={{ position: "relative", width: "100%", maxWidth: 440, background: "#ffffff", border: "1px solid #e8e6e0", borderRadius: 20, padding: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
            <button
              onClick={() => setShowEmailModal(false)}
              style={{ position: "absolute", right: 16, top: 16, background: "none", border: "none", fontSize: 16, color: "#9b99b0", cursor: "pointer", lineHeight: 1 }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#1a1a2e"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#9b99b0"; }}
            >
              ✕
            </button>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9b99b0", marginBottom: 10 }}>
              Your results are ready
            </p>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1a1a2e", lineHeight: 1.3, marginBottom: 10 }}>
              Get your full results emailed to you
            </h2>
            <p style={{ fontSize: 14, color: "#6b6b80", lineHeight: 1.6 }}>
              We'll send you your {result?.total_points} points, your tier breakdown, and your personalised quick wins — all in one email to save and share.
            </p>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
              placeholder="your@email.com"
              style={{
                marginTop: 18,
                width: "100%",
                background: "#f5f3ee",
                border: "1.5px solid #e8e6e0",
                borderRadius: 12,
                padding: "12px 14px",
                fontSize: 14,
                color: "#1a1a2e",
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
              onFocus={e => (e.target.style.borderColor = "#002FA7")}
              onBlur={e => (e.target.style.borderColor = "#e8e6e0")}
            />
            <button
              onClick={handleEmailSubmit}
              disabled={emailSubmitting || !emailInput.includes("@")}
              style={{
                marginTop: 10,
                width: "100%",
                background: "#002FA7",
                color: "#ffffff",
                border: "none",
                borderRadius: 12,
                padding: "13px",
                fontSize: 14,
                fontWeight: 700,
                cursor: emailSubmitting || !emailInput.includes("@") ? "not-allowed" : "pointer",
                opacity: emailSubmitting || !emailInput.includes("@") ? 0.4 : 1,
                transition: "background 0.15s",
                fontFamily: "inherit",
              }}
            >
              {emailSubmitting ? "Sending…" : "Send me my results"}
            </button>
            <button
              onClick={() => setShowEmailModal(false)}
              style={{ marginTop: 10, width: "100%", background: "none", border: "none", fontSize: 13, color: "#9b99b0", cursor: "pointer", padding: "6px", fontFamily: "inherit", transition: "color 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#6b6b80"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#9b99b0"; }}
            >
              No thanks
            </button>
          </div>
        </div>
      )}

      {/* ── Success modal ── */}
      {showEmailModal && emailSubmitted && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px", background: "rgba(26,26,46,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="animate-fade-up" style={{ position: "relative", width: "100%", maxWidth: 440, background: "#ffffff", border: "1px solid #e8e6e0", borderRadius: 20, padding: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.12)", textAlign: "center" }}>
            <div style={{ width: 48, height: 48, background: "#e5eaf8", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 22, color: "#002FA7" }}>
              ✓
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1a1a2e", marginBottom: 10 }}>Check your inbox</h2>
            <p style={{ fontSize: 14, color: "#6b6b80", lineHeight: 1.6 }}>We've saved your results and will be in touch with personalised university guidance.</p>
            <button
              onClick={() => setShowEmailModal(false)}
              style={{
                marginTop: 20,
                width: "100%",
                background: "#002FA7",
                color: "#ffffff",
                border: "none",
                borderRadius: 12,
                padding: "13px",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
