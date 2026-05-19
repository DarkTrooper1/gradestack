"use client";

import { SyntheticEvent, useEffect, useMemo, useState } from "react";
import ShortlistedBanner from "@/components/shortlisted-banner";

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

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
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
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1; }
        }
        .glow-dot { animation: pulse-glow 2.5s ease-in-out infinite; }
        * { box-sizing: border-box; }
      `}</style>

      {/* ── Navbar ── */}
      <nav style={{ borderBottom: "1px solid #1d2640", background: "rgba(7,11,20,0.85)", backdropFilter: "blur(14px)", position: "sticky", top: 0, zIndex: 40, padding: "0 16px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, background: "linear-gradient(135deg, #4f72ff, #00d4ff)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 0 12px rgba(79,114,255,0.4)" }}>
              <svg viewBox="0 0 64 64" width="17" height="17" fill="none">
                <path d="M12 50 L32 14 L52 50" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={{ color: "#f0f4ff", fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" }}>Gradestack</span>
          </div>
          <a
            href="/shortlisted"
            style={{ fontSize: 13, color: "#8a9bc4", textDecoration: "none", fontWeight: 500, padding: "6px 14px", borderRadius: 8, border: "1px solid #1d2640", transition: "all 0.15s" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.color = "#f0f4ff"; el.style.borderColor = "#253060"; el.style.background = "#0d1226"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.color = "#8a9bc4"; el.style.borderColor = "#1d2640"; el.style.background = "transparent"; }}
          >
            Personal Statement
          </a>
        </div>
      </nav>

      <main style={{ background: "#070b14", minHeight: "100vh", padding: "0 16px 80px", position: "relative" }}>

        {/* ambient glow */}
        <div style={{ position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: 900, height: 600, background: "radial-gradient(ellipse at 50% 0%, rgba(79,114,255,0.09) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

        {/* ── Hero ── */}
        <section style={{ maxWidth: 680, margin: "0 auto", padding: "72px 0 52px", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(79,114,255,0.08)", border: "1px solid rgba(79,114,255,0.22)", borderRadius: 999, padding: "5px 14px", marginBottom: 26 }}>
            <span className="glow-dot" style={{ width: 6, height: 6, background: "#4f72ff", borderRadius: "50%", display: "inline-block" }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7ea4ff" }}>UCAS Tariff Calculator</span>
          </div>
          <h1 style={{ fontSize: "clamp(36px, 7vw, 62px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, color: "#f0f4ff", margin: "0 0 18px" }}>
            Know your{" "}
            <span style={{ background: "linear-gradient(120deg, #4f72ff 0%, #00d4ff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              points.
            </span>
            <br />Own your future.
          </h1>
          <p style={{ fontSize: 17, color: "#8a9bc4", lineHeight: 1.65, maxWidth: 420, margin: "0 auto" }}>
            Instantly calculate your UCAS tariff and see exactly where you stand.
          </p>
        </section>

        {/* ── Input card ── */}
        <section style={{ maxWidth: 680, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <form
            onSubmit={handleSubmit}
            style={{ background: "#0d1226", border: "1px solid #1d2640", borderRadius: 20, padding: 28 }}
          >
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#4a5680", marginBottom: 10 }}>
              Your qualifications
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your qualifications in plain English — e.g. A* Maths, A Physics, B Chemistry, EPQ grade A"
              style={{
                width: "100%",
                minHeight: 160,
                background: "#070b14",
                border: "1.5px solid #1d2640",
                borderRadius: 12,
                padding: "14px 16px",
                fontSize: 14,
                color: "#f0f4ff",
                lineHeight: 1.65,
                resize: "none",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
                fontFamily: "inherit",
              }}
              onFocus={e => (e.target.style.borderColor = "#4f72ff")}
              onBlur={e => (e.target.style.borderColor = "#1d2640")}
            />
            <button
              type="submit"
              disabled={isSubmitting || !input.trim()}
              style={{
                marginTop: 12,
                width: "100%",
                background: isSubmitting || !input.trim() ? "#131929" : "linear-gradient(135deg, #4f72ff 0%, #3b5ce8 100%)",
                color: isSubmitting || !input.trim() ? "#4a5680" : "#ffffff",
                border: `1px solid ${isSubmitting || !input.trim() ? "#1d2640" : "transparent"}`,
                borderRadius: 12,
                padding: "14px",
                fontSize: 15,
                fontWeight: 700,
                cursor: isSubmitting || !input.trim() ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.2s",
                boxShadow: isSubmitting || !input.trim() ? "none" : "0 0 28px rgba(79,114,255,0.35)",
              }}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin" style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none">
                    <circle style={{ opacity: 0.15 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Calculating…
                </>
              ) : (
                "Calculate my points →"
              )}
            </button>
          </form>

          {error && (
            <div style={{ marginTop: 10, background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 12, padding: "12px 16px", fontSize: 14, color: "#f87171" }}>
              {error}
            </div>
          )}
        </section>

        {/* ── Results ── */}
        {result && (
          <section className="animate-fade-up" style={{ maxWidth: 680, margin: "28px auto 0", display: "flex", flexDirection: "column", gap: 10, position: "relative", zIndex: 1 }}>

            {/* Total score card */}
            <div style={{ background: "linear-gradient(160deg, #0d1226 0%, #08102a 100%)", border: "1px solid #1d2640", borderRadius: 24, padding: "44px 28px 36px", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -60%)", width: 400, height: 400, background: "radial-gradient(circle, rgba(79,114,255,0.1) 0%, transparent 65%)", pointerEvents: "none" }} />
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#3a4870", marginBottom: 8, position: "relative" }}>
                Total UCAS Points
              </p>
              <p style={{ fontSize: "clamp(72px, 14vw, 108px)", fontWeight: 900, lineHeight: 1, letterSpacing: "-0.05em", background: "linear-gradient(140deg, #ffffff 30%, #7ea4ff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", position: "relative" } as React.CSSProperties}>
                {result.total_points}
              </p>

              {scenarioMode && scenarioTotal !== null && (
                <div style={{ marginTop: 20, display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 6, background: "rgba(79,114,255,0.07)", border: "1px solid rgba(79,114,255,0.18)", borderRadius: 16, padding: "16px 24px" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#3a4870" }}>Scenario Total</p>
                  <p style={{
                    fontSize: 48,
                    fontWeight: 900,
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                    color: scenarioTotal > result.total_points ? "#22d3a0" : scenarioTotal < result.total_points ? "#f87171" : "#f0f4ff",
                  }}>
                    {scenarioCalculating ? "…" : scenarioTotal}
                    {!scenarioCalculating && scenarioTotal !== result.total_points && (
                      <span style={{ fontSize: 22, marginLeft: 8, fontWeight: 700 }}>
                        {scenarioTotal > result.total_points ? `+${scenarioTotal - result.total_points}` : `${scenarioTotal - result.total_points}`}
                      </span>
                    )}
                  </p>
                </div>
              )}

              {result.context?.tier_label && (
                <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
                  <span style={{ background: "rgba(79,114,255,0.1)", color: "#8ab4ff", border: "1px solid rgba(79,114,255,0.22)", borderRadius: 999, padding: "5px 18px", fontSize: 13, fontWeight: 600 }}>
                    {result.context.tier_label}
                  </span>
                </div>
              )}

              {result.context?.tier_description && (
                <p style={{ marginTop: 12, fontSize: 14, color: "#8a9bc4", lineHeight: 1.65, maxWidth: 460, margin: "12px auto 0", position: "relative" }}>
                  {result.context.tier_description}
                </p>
              )}

              {result.context?.quick_wins && result.context.quick_wins.length > 0 && (
                <div style={{ marginTop: 30, borderTop: "1px solid #1a2240", paddingTop: 26, position: "relative" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#3a4870", marginBottom: 16 }}>Quick Wins</p>
                  {emailSubmitted ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {result.context.quick_wins.map((win, i) => (
                        <div key={i} style={{ background: "rgba(34,211,160,0.05)", border: "1px solid rgba(34,211,160,0.15)", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, textAlign: "left" }}>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "#f0f4ff", marginBottom: 3 }}>{win.title}</p>
                            <p style={{ fontSize: 13, color: "#8a9bc4", lineHeight: 1.5 }}>{win.description}</p>
                          </div>
                          {win.points_gain > 0 && (
                            <span style={{ flexShrink: 0, background: "rgba(34,211,160,0.1)", border: "1px solid rgba(34,211,160,0.22)", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 700, color: "#22d3a0" }}>
                              +{win.points_gain} pts
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ position: "relative" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {result.context.quick_wins.map((win, i) => (
                          <div key={i} style={{ background: "rgba(34,211,160,0.05)", border: "1px solid rgba(34,211,160,0.15)", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, textAlign: "left", filter: "blur(5px)", userSelect: "none", pointerEvents: "none" }}>
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 600, color: "#f0f4ff", marginBottom: 3 }}>{win.title}</p>
                              <p style={{ fontSize: 13, color: "#8a9bc4" }}>{win.description}</p>
                            </div>
                            {win.points_gain > 0 && (
                              <span style={{ flexShrink: 0, background: "rgba(34,211,160,0.1)", border: "1px solid rgba(34,211,160,0.22)", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 700, color: "#22d3a0" }}>
                                +{win.points_gain} pts
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#f0f4ff" }}>Unlock your personalised quick wins</p>
                        <button
                          onClick={() => setShowEmailModal(true)}
                          style={{ background: "linear-gradient(135deg, #4f72ff 0%, #3b5ce8 100%)", color: "#ffffff", border: "none", borderRadius: 10, padding: "9px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 0 18px rgba(79,114,255,0.35)" }}
                        >
                          Get full results by email
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {result.warnings && result.warnings.length > 0 && (
                <ul style={{ marginTop: 20, borderTop: "1px solid #1a2240", paddingTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                  {result.warnings.map((w, i) => (
                    <li key={i} style={{ fontSize: 12, color: "#3a4870", listStyle: "none" }}>
                      {w}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Qualification cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {cards.map((q, i) => {
                const excluded = q.excluded;
                const found = q.lookup_status === "found" && !excluded;
                const leftAccent = excluded ? "#1d2640" : found ? "#4f72ff" : q.lookup_status === "ambiguous" ? "#fbbf24" : "#1d2640";
                return (
                  <div
                    key={`${q.raw}-${i}`}
                    style={{
                      background: "#0d1226",
                      border: "1px solid #1d2640",
                      borderLeft: `3px solid ${leftAccent}`,
                      borderRadius: 12,
                      padding: "14px 18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                      opacity: excluded ? 0.35 : 1,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#3a4870", marginBottom: 3 }}>
                        {formatType(q.type)}
                      </p>
                      {scenarioMode && found ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 2 }}>
                          <select
                            value={scenarioGrades[i] ?? q.grade}
                            onChange={(e) => recalculateScenario(i, e.target.value)}
                            style={{
                              background: "#070b14",
                              border: "1.5px solid #1d2640",
                              borderRadius: 8,
                              padding: "5px 10px",
                              fontSize: 13,
                              fontWeight: 500,
                              color: "#f0f4ff",
                              outline: "none",
                              cursor: "pointer",
                              fontFamily: "inherit",
                            }}
                            onFocus={e => (e.target.style.borderColor = "#4f72ff")}
                            onBlur={e => (e.target.style.borderColor = "#1d2640")}
                          >
                            {(GRADE_OPTIONS[q.type] ?? [q.grade]).map((g) => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                          {scenarioGrades[i] && scenarioGrades[i] !== q.grade && (
                            <span style={{ fontSize: 12, color: "#3a4870", textDecoration: "line-through" }}>{q.grade}</span>
                          )}
                        </div>
                      ) : (
                        <p style={{ fontSize: 14, fontWeight: 500, color: found ? "#f0f4ff" : "#3a4870", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
                        <span style={{ background: "#131929", border: "1px solid #1d2640", borderRadius: 8, padding: "4px 10px", fontSize: 13, fontWeight: 700, color: "#3a4870", textDecoration: "line-through" }}>
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
                              background: increased ? "rgba(34,211,160,0.09)" : decreased ? "rgba(248,113,113,0.09)" : "rgba(79,114,255,0.09)",
                              border: `1px solid ${increased ? "rgba(34,211,160,0.28)" : decreased ? "rgba(248,113,113,0.28)" : "rgba(79,114,255,0.28)"}`,
                              borderRadius: 8,
                              padding: "4px 10px",
                              fontSize: 13,
                              fontWeight: 700,
                              color: increased ? "#22d3a0" : decreased ? "#f87171" : "#8ab4ff",
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
                            background: "rgba(251,191,36,0.07)",
                            border: "1.5px solid rgba(251,191,36,0.28)",
                            borderRadius: 8,
                            padding: "4px 10px",
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#fbbf24",
                            cursor: "pointer",
                            outline: "none",
                            fontFamily: "inherit",
                          }}
                        >
                          <option value="" disabled>Grade?</option>
                          {(GRADE_OPTIONS[q.type] ?? ["A*", "A", "B", "C", "D", "E"]).map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      ) : (
                        <span style={{ background: "#131929", border: "1px solid #1d2640", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 500, color: "#3a4870" }}>
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
          <div className="animate-fade-up" style={{ maxWidth: 680, margin: "10px auto 0", position: "relative", zIndex: 1 }}>
            <div style={{ background: "#0d1226", border: "1px solid #1d2640", borderRadius: 20, padding: "40px 36px 32px", textAlign: "center", marginTop: 0 }}>
              <div style={{ display: "inline-block", background: "rgba(79,114,255,0.07)", border: "1px solid rgba(79,114,255,0.18)", borderRadius: 999, padding: "4px 14px", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4f72ff", marginBottom: 20 }}>Coming Soon</div>
              <p style={{ fontSize: 24, fontWeight: 800, color: "#f0f4ff", letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: 12 }}>Find out where {result.total_points} points takes you</p>
              <p style={{ fontSize: 15, color: "#8a9bc4", lineHeight: 1.65, maxWidth: 380, margin: "0 auto" }}>We&apos;re building a university matching feature that will show you a personalised list of courses matched to your points — with likelihood ratings and direct links to apply.</p>
            </div>
          </div>
        )}

        {result && matchResults && matchResults.length > 0 && (
          <section className="animate-fade-up" style={{ maxWidth: 680, margin: "10px auto 0", position: "relative", zIndex: 1 }}>
            <div style={{ background: "#0d1226", border: "1px solid #1d2640", borderRadius: 20, padding: "20px 24px", marginBottom: 10 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#3a4870", marginBottom: 4 }}>University Match</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: "#f0f4ff" }}>{matchResults.length} courses matched to your points</p>
            </div>
            {(['Likely', 'Target', 'Aspirational'] as const).map((label) => {
              const group = matchResults.filter(r => r.label === label);
              if (!group.length) return null;
              const labelColor = label === 'Likely' ? '#22d3a0' : label === 'Target' ? '#8ab4ff' : '#fbbf24';
              const labelBg = label === 'Likely' ? 'rgba(34,211,160,0.07)' : label === 'Target' ? 'rgba(79,114,255,0.07)' : 'rgba(251,191,36,0.07)';
              const labelBorder = label === 'Likely' ? 'rgba(34,211,160,0.22)' : label === 'Target' ? 'rgba(79,114,255,0.22)' : 'rgba(251,191,36,0.22)';
              return (
                <div key={label} style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#3a4870", marginBottom: 8, paddingLeft: 4 }}>{label}</p>
                  {group.map((r, i) => (
                    <a key={i} href={r.url} target="_blank" rel="noreferrer"
                      style={{ display: "block", background: "#0d1226", border: "1px solid #1d2640", borderRadius: 12, padding: "14px 18px", marginBottom: 6, textDecoration: "none", transition: "border-color 0.15s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#253060"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1d2640"; }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#3a4870", marginBottom: 3 }}>{r.name} · {r.city}</p>
                          <p style={{ fontSize: 14, fontWeight: 500, color: "#f0f4ff" }}>{r.course}</p>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8, whiteSpace: "nowrap", background: labelBg, color: labelColor, border: `1px solid ${labelBorder}` }}>
                          {r.label} · {r.typical_points} pts
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              );
            })}
          </section>
        )}

        {result && matchResults && matchResults.length > 0 && (
          <div className="animate-fade-up" style={{ maxWidth: 680, margin: "10px auto 0", position: "relative", zIndex: 1 }}>
            <ShortlistedBanner />
          </div>
        )}

        {/* Scenario toggle */}
        {result && (
          <div style={{ maxWidth: 680, margin: "16px auto 0", display: "flex", justifyContent: "center", position: "relative", zIndex: 1 }}>
            <button
              onClick={() => {
                setScenarioMode(!scenarioMode);
                setScenarioGrades({});
                setScenarioTotal(null);
                setScenarioQuals(null);
              }}
              style={{
                background: scenarioMode ? "rgba(79,114,255,0.1)" : "transparent",
                border: `1px solid ${scenarioMode ? "rgba(79,114,255,0.32)" : "#1d2640"}`,
                borderRadius: 10,
                padding: "9px 20px",
                fontSize: 13,
                fontWeight: 600,
                color: scenarioMode ? "#8ab4ff" : "#8a9bc4",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { if (!scenarioMode) { (e.currentTarget as HTMLButtonElement).style.borderColor = "#253060"; (e.currentTarget as HTMLButtonElement).style.color = "#f0f4ff"; } }}
              onMouseLeave={e => { if (!scenarioMode) { (e.currentTarget as HTMLButtonElement).style.borderColor = "#1d2640"; (e.currentTarget as HTMLButtonElement).style.color = "#8a9bc4"; } }}
            >
              {scenarioMode ? "Exit scenario mode" : "Try a scenario"}
            </button>
          </div>
        )}
      </main>

      {/* ── Shortlisted banner ── */}
      <div style={{ background: "#0d1226", borderTop: "1px solid #1d2640", borderBottom: "1px solid #1d2640", padding: "14px 16px" }}>
        <a
          href="/shortlisted"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 680, margin: "0 auto", textDecoration: "none", gap: 12 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#ff7a5c", background: "rgba(255,122,92,0.1)", border: "1px solid rgba(255,122,92,0.22)", borderRadius: 6, padding: "2px 8px" }}>New</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#f0f4ff" }}>Get AI feedback on your personal statement</span>
            <span style={{ fontSize: 14, color: "#8a9bc4", display: "none" }} className="sm:inline">— scored by an expert AI reviewer</span>
          </div>
          <span style={{ fontSize: 13, color: "#ff7a5c", fontWeight: 600, whiteSpace: "nowrap" }}>Try Shortlisted →</span>
        </a>
      </div>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid #1d2640", background: "#070b14", padding: "20px 16px", textAlign: "center" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <p style={{ fontSize: 12, color: "#3a4870", margin: 0 }}>
            &copy; {new Date().getFullYear()} Gradestack &nbsp;&middot;&nbsp;{" "}
            <a href="/privacy" style={{ color: "#3a4870", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#8a9bc4"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#3a4870"; }}>
              Privacy Policy
            </a>
            {" "}&nbsp;&middot;&nbsp;{" "}
            <a href="/terms" style={{ color: "#3a4870", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#8a9bc4"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#3a4870"; }}>
              Terms &amp; Conditions
            </a>
          </p>
        </div>
      </footer>

      {/* ── Email modal ── */}
      {showEmailModal && !emailSubmitted && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }}>
          <div className="animate-fade-up" style={{ position: "relative", width: "100%", maxWidth: 440, background: "#0d1226", border: "1px solid #1d2640", borderRadius: 20, padding: 32, boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}>
            <button
              onClick={() => setShowEmailModal(false)}
              style={{ position: "absolute", right: 16, top: 16, background: "none", border: "none", fontSize: 16, color: "#3a4870", cursor: "pointer", lineHeight: 1, transition: "color 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#f0f4ff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#3a4870"; }}
            >
              ✕
            </button>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#3a4870", marginBottom: 10 }}>
              Your results are ready
            </p>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f0f4ff", lineHeight: 1.2, marginBottom: 10 }}>
              Get your full results emailed to you
            </h2>
            <p style={{ fontSize: 14, color: "#8a9bc4", lineHeight: 1.65 }}>
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
                background: "#070b14",
                border: "1.5px solid #1d2640",
                borderRadius: 12,
                padding: "12px 14px",
                fontSize: 14,
                color: "#f0f4ff",
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
                transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "#4f72ff")}
              onBlur={e => (e.target.style.borderColor = "#1d2640")}
            />
            <button
              onClick={handleEmailSubmit}
              disabled={emailSubmitting || !emailInput.includes("@")}
              style={{
                marginTop: 10,
                width: "100%",
                background: emailSubmitting || !emailInput.includes("@") ? "#131929" : "linear-gradient(135deg, #4f72ff 0%, #3b5ce8 100%)",
                color: emailSubmitting || !emailInput.includes("@") ? "#4a5680" : "#ffffff",
                border: "none",
                borderRadius: 12,
                padding: "13px",
                fontSize: 14,
                fontWeight: 700,
                cursor: emailSubmitting || !emailInput.includes("@") ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                fontFamily: "inherit",
                boxShadow: emailSubmitting || !emailInput.includes("@") ? "none" : "0 0 22px rgba(79,114,255,0.32)",
              }}
            >
              {emailSubmitting ? "Sending…" : "Send me my results"}
            </button>
            <button
              onClick={() => setShowEmailModal(false)}
              style={{ marginTop: 10, width: "100%", background: "none", border: "none", fontSize: 13, color: "#3a4870", cursor: "pointer", padding: "6px", fontFamily: "inherit", transition: "color 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#8a9bc4"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#3a4870"; }}
            >
              No thanks
            </button>
          </div>
        </div>
      )}

      {/* ── Success modal ── */}
      {showEmailModal && emailSubmitted && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }}>
          <div className="animate-fade-up" style={{ position: "relative", width: "100%", maxWidth: 440, background: "#0d1226", border: "1px solid #1d2640", borderRadius: 20, padding: 32, boxShadow: "0 24px 80px rgba(0,0,0,0.6)", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, background: "rgba(34,211,160,0.09)", border: "1px solid rgba(34,211,160,0.22)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", fontSize: 22, color: "#22d3a0" }}>
              ✓
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f0f4ff", marginBottom: 10 }}>Check your inbox</h2>
            <p style={{ fontSize: 14, color: "#8a9bc4", lineHeight: 1.65 }}>We've saved your results and will be in touch with personalised university guidance.</p>
            <button
              onClick={() => setShowEmailModal(false)}
              style={{
                marginTop: 20,
                width: "100%",
                background: "linear-gradient(135deg, #4f72ff 0%, #3b5ce8 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: 12,
                padding: "13px",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 0 22px rgba(79,114,255,0.32)",
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
