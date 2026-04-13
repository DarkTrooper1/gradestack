"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import ScoreRing from "@/components/shortlisted/ScoreRing";
import CriterionCard from "@/components/shortlisted/CriterionCard";
import ParagraphAnnotations from "@/components/shortlisted/ParagraphAnnotations";
import RewriteSuggestions from "@/components/shortlisted/RewriteSuggestions";
import type { FreeAnalysis, PaidAnalysis } from "@/lib/shortlisted/types";

const CRITERIA_ORDER = [
  { key: "passion_motivation", label: "Passion & Motivation" },
  { key: "academic_potential", label: "Academic Potential" },
  { key: "relevant_experience", label: "Relevant Experience" },
  { key: "writing_quality", label: "Writing Quality" },
  { key: "course_suitability", label: "Course Suitability" },
] as const;

type CriteriaKey = (typeof CRITERIA_ORDER)[number]["key"];

const S = "var(--font-instrument-serif)";
const N = "var(--font-instrument-sans), system-ui, sans-serif";
const CARD_STYLE = {
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "12px",
} as const;

function CenteredFallback({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: N }}>
      {children}
    </div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("id");
  const paymentSuccess = searchParams.get("payment") === "success";

  const [free, setFree] = useState<FreeAnalysis | null>(null);
  const [paid, setPaid] = useState<PaidAnalysis | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const analysePaidFiredRef = useRef(false);

  useEffect(() => {
    if (!sessionId || analysePaidFiredRef.current) return;
    analysePaidFiredRef.current = true;
    fetch("/shortlisted/api/analyse-paid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
      keepalive: true,
    }).catch(() => {});
  }, [sessionId]);

  const fetchResults = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/shortlisted/api/results?id=${sessionId}`);
      if (!res.ok) {
        setError(
          res.status === 404
            ? "Results not found. They may have expired after 48 hours."
            : "Failed to load results."
        );
        return;
      }
      const data = await res.json();
      if (data.free) setFree(data.free);
      if (data.paid) {
        setPaid(data.paid);
        setPolling(false);
      }
    } catch {
      setError("Failed to load results. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID provided.");
      setLoading(false);
      return;
    }
    fetchResults();
  }, [sessionId, fetchResults]);

  useEffect(() => {
    if (!paymentSuccess || paid) return;
    setPolling(true);
    const interval = setInterval(async () => {
      if (!sessionId) return;
      try {
        const res = await fetch(`/shortlisted/api/results?id=${sessionId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.paid) {
          setPaid(data.paid);
          setPolling(false);
          clearInterval(interval);
          router.replace(`/shortlisted/results?id=${sessionId}`);
        }
      } catch {
        // keep polling silently
      }
    }, 2000);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setPolling(false);
    }, 180000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [paymentSuccess, paid, sessionId, router]);

  async function handleUnlock() {
    if (!sessionId) return;
    setCheckoutLoading(true);
    try {
      const res = await fetch("/shortlisted/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      if (data.url) window.location.href = data.url;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Checkout failed. Please try again.");
      setCheckoutLoading(false);
    }
  }

  if (!sessionId) {
    return (
      <CenteredFallback>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.45)", marginBottom: "16px" }}>No session found.</p>
          <a href="/shortlisted" style={{ color: "#e8b84b", fontSize: "14px" }}>Start a new analysis</a>
        </div>
      </CenteredFallback>
    );
  }

  if (loading) {
    return (
      <CenteredFallback>
        <div style={{ textAlign: "center" }}>
          <div
            className="animate-spin"
            style={{ width: "40px", height: "40px", borderRadius: "50%", border: "4px solid rgba(232,184,75,0.2)", borderTopColor: "#e8b84b", margin: "0 auto 16px" }}
          />
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "14px" }}>Analysing your statement...</p>
        </div>
      </CenteredFallback>
    );
  }

  if (error) {
    return (
      <CenteredFallback>
        <div style={{ textAlign: "center", maxWidth: "360px" }}>
          <p style={{ color: "#fca5a5", marginBottom: "16px" }}>{error}</p>
          <a href="/shortlisted" style={{ color: "#e8b84b", fontSize: "14px" }}>Start a new analysis</a>
        </div>
      </CenteredFallback>
    );
  }

  if (!free) {
    return (
      <CenteredFallback>
        <p style={{ color: "rgba(255,255,255,0.45)" }}>No results found.</p>
      </CenteredFallback>
    );
  }

  const analysis = paid ?? free;
  const isPaid = !!paid;

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: N }}>

      {/* Nav */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(13,31,60,0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "16px 24px",
      }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/shortlisted" style={{ fontFamily: S, fontSize: "20px", color: "#ffffff", textDecoration: "none" }}>
            Shortlisted
          </a>
          <a href="/shortlisted" style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>
            New analysis
          </a>
        </div>
      </header>

      <div style={{ maxWidth: "720px", margin: "0 auto", width: "100%", padding: "40px 24px", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Overall score card */}
        <div
          className="flex flex-col sm:flex-row items-center gap-8"
          style={{ ...CARD_STYLE, padding: "32px" }}
        >
          <ScoreRing score={analysis.overall_score} size={140} />
          <div className="flex-1 text-center sm:text-left">
            <h1 style={{ fontFamily: S, fontSize: "24px", color: "#ffffff", marginBottom: "8px" }}>
              Your Results
            </h1>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "#ffffff", marginBottom: "8px" }}>
              {analysis.overall_verdict}
            </p>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.65 }}>
              {analysis.overall_summary}
            </p>
          </div>
        </div>

        {/* Polling banner */}
        {polling && (
          <div style={{ ...CARD_STYLE, padding: "20px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              className="animate-spin flex-shrink-0"
              style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2px solid rgba(232,184,75,0.25)", borderTopColor: "#e8b84b" }}
            />
            <div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#e8b84b", marginBottom: "2px" }}>
                Unlocking your full analysis...
              </p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>
                Confirming payment. This usually takes a few seconds.
              </p>
            </div>
          </div>
        )}

        {/* Criterion cards */}
        <section>
          <h2 style={{ fontFamily: S, fontSize: "18px", color: "#ffffff", marginBottom: "16px" }}>
            Criterion Scores
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {CRITERIA_ORDER.map(({ key, label }, index) => {
              const criterion = analysis.criteria[key as CriteriaKey];
              const isLocked = !isPaid && index > 0;
              return (
                <CriterionCard key={key} label={label} criterion={criterion} locked={isLocked} />
              );
            })}
          </div>
        </section>

        {/* Unlock CTA */}
        {!isPaid && !polling && (
          <div style={{ ...CARD_STYLE, padding: "36px 32px", textAlign: "center" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "50%",
              background: "rgba(232,184,75,0.1)", border: "1px solid rgba(232,184,75,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e8b84b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2 style={{ fontFamily: S, fontSize: "22px", color: "#ffffff", marginBottom: "8px" }}>
              Unlock your full analysis
            </h2>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", maxWidth: "380px", margin: "0 auto 24px", lineHeight: 1.65 }}>
              Get detailed feedback on all 5 criteria, paragraph-by-paragraph annotations, and targeted rewrite suggestions.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 auto 28px", maxWidth: "300px", display: "flex", flexDirection: "column", gap: "10px", textAlign: "left" }}>
              {[
                "All 5 criteria with scores, summaries & fixes",
                "Paragraph-by-paragraph annotations",
                "2-3 targeted rewrite suggestions",
                "Full results emailed to you",
              ].map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e8b84b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "2px" }}>
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={handleUnlock}
              disabled={checkoutLoading}
              style={{
                width: "100%", maxWidth: "280px",
                background: "#e8b84b", color: "#0d1f3c",
                border: "none", borderRadius: "8px",
                padding: "16px 24px", fontSize: "15px", fontWeight: 600,
                fontFamily: N, cursor: checkoutLoading ? "not-allowed" : "pointer",
                opacity: checkoutLoading ? 0.6 : 1,
                transition: "opacity 0.15s",
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
            >
              {checkoutLoading ? (
                <>
                  <span
                    className="animate-spin"
                    style={{ width: "16px", height: "16px", border: "2px solid rgba(13,31,60,0.25)", borderTopColor: "#0d1f3c", borderRadius: "50%", flexShrink: 0 }}
                  />
                  Redirecting to payment...
                </>
              ) : (
                "Unlock full analysis — £4.99"
              )}
            </button>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", marginTop: "12px" }}>
              Secure payment via Stripe
            </p>
          </div>
        )}

        {/* Paragraph annotations */}
        {isPaid && paid.paragraph_annotations?.length > 0 && (
          <section>
            <h2 style={{ fontFamily: S, fontSize: "18px", color: "#ffffff", marginBottom: "16px" }}>
              Paragraph Breakdown
            </h2>
            <ParagraphAnnotations annotations={paid.paragraph_annotations} />
          </section>
        )}

        {/* Rewrite suggestions */}
        {isPaid && paid.rewrite_suggestions?.length > 0 && (
          <section>
            <h2 style={{ fontFamily: S, fontSize: "18px", color: "#ffffff", marginBottom: "16px" }}>
              Rewrite Suggestions
            </h2>
            <RewriteSuggestions suggestions={paid.rewrite_suggestions} />
          </section>
        )}

      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "20px 24px", textAlign: "center", marginTop: "auto" }}>
        <p style={{ fontSize: "12px" }}>
          <a href="/shortlisted/privacy" className="sl-footer-link">Privacy Policy</a>
          {" · "}
          <a href="/shortlisted/terms" className="sl-footer-link">Terms &amp; Conditions</a>
          {" · "}
          <span style={{ color: "rgba(255,255,255,0.25)" }}>&copy; 2026 Shortlisted</span>
        </p>
      </footer>
    </main>
  );
}

export default function ShortlistedResultsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            className="animate-spin"
            style={{ width: "40px", height: "40px", borderRadius: "50%", border: "4px solid rgba(232,184,75,0.2)", borderTopColor: "#e8b84b" }}
          />
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
