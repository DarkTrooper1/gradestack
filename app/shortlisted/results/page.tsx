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

const serif = "var(--font-cormorant), 'Cormorant Garamond', serif";
const sans = "var(--font-inter), 'Inter', sans-serif";

const CARD: React.CSSProperties = {
  background: "#fff",
  borderRadius: "12px",
  border: "1px solid #e8e3db",
  boxShadow: "0 2px 16px rgba(13,34,68,0.06)",
  padding: "24px",
};

function FooterLinks() {
  return (
    <footer style={{ textAlign: "center", padding: "0 20px 24px" }}>
      <p style={{ margin: 0 }}>
        <a href="/shortlisted/privacy" style={{ fontSize: "11px", color: "#a09890", textDecoration: "none", margin: "0 8px" }}>Privacy Policy</a>
        <a href="/shortlisted/terms" style={{ fontSize: "11px", color: "#a09890", textDecoration: "none", margin: "0 8px" }}>Terms &amp; Conditions</a>
        <span style={{ fontSize: "11px", color: "#a09890", margin: "0 8px" }}>&copy; 2026 Shortlisted</span>
      </p>
    </footer>
  );
}

function Nav({ showNewAnalysis }: { showNewAnalysis?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 40px" }}>
      <a href="/shortlisted" style={{ fontFamily: serif, fontSize: "22px", fontWeight: 600, color: "#fff", textDecoration: "none" }}>
        Shortlisted
      </a>
      {showNewAnalysis && (
        <a href="/shortlisted" style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", fontFamily: sans, textDecoration: "none" }}>
          New analysis
        </a>
      )}
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
      <main style={{ minHeight: "100vh", fontFamily: sans }}>
        <Nav />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#4a4540", marginBottom: "16px" }}>No session found.</p>
            <a href="/shortlisted" style={{ color: "#0d2244", fontSize: "14px" }}>Start a new analysis</a>
          </div>
        </div>
        <FooterLinks />
      </main>
    );
  }

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", fontFamily: sans }}>
        <Nav />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
          <div style={{ textAlign: "center" }}>
            <div
              className="animate-spin"
              style={{ width: "40px", height: "40px", borderRadius: "50%", border: "4px solid rgba(13,34,68,0.1)", borderTopColor: "#0d2244", margin: "0 auto 16px" }}
            />
            <p style={{ color: "#4a4540", fontSize: "14px" }}>Analysing your statement...</p>
          </div>
        </div>
        <FooterLinks />
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ minHeight: "100vh", fontFamily: sans }}>
        <Nav />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
          <div style={{ textAlign: "center", maxWidth: "360px" }}>
            <p style={{ color: "#c00", marginBottom: "16px" }}>{error}</p>
            <a href="/shortlisted" style={{ color: "#0d2244", fontSize: "14px" }}>Start a new analysis</a>
          </div>
        </div>
        <FooterLinks />
      </main>
    );
  }

  if (!free) {
    return (
      <main style={{ minHeight: "100vh", fontFamily: sans }}>
        <Nav />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
          <p style={{ color: "#4a4540" }}>No results found.</p>
        </div>
        <FooterLinks />
      </main>
    );
  }

  const analysis = paid ?? free;
  const isPaid = !!paid;

  return (
    <main style={{ minHeight: "100vh", fontFamily: sans }}>

      <Nav showNewAnalysis />

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "24px 24px 0", display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Score card */}
        <div
          className="flex flex-col sm:flex-row items-center gap-8"
          style={CARD}
        >
          <ScoreRing score={analysis.overall_score} size={140} />
          <div className="flex-1 text-center sm:text-left">
            <h1 style={{ fontFamily: serif, fontSize: "24px", color: "#0d2244", marginBottom: "8px", marginTop: 0 }}>
              Your Results
            </h1>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "#0d2244", marginBottom: "8px", marginTop: 0 }}>
              {analysis.overall_verdict}
            </p>
            <p style={{ fontSize: "14px", color: "#4a4540", lineHeight: 1.65, margin: 0 }}>
              {analysis.overall_summary}
            </p>
          </div>
        </div>

        {/* Polling banner */}
        {polling && (
          <div style={{ background: "#fff", border: "1px solid #e8e3db", borderRadius: "12px", padding: "20px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              className="animate-spin flex-shrink-0"
              style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2px solid rgba(13,34,68,0.1)", borderTopColor: "#0d2244" }}
            />
            <div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#0d2244", marginBottom: "2px", marginTop: 0 }}>
                Unlocking your full analysis...
              </p>
              <p style={{ fontSize: "12px", color: "#9e9890", margin: 0 }}>
                Confirming payment. This usually takes a few seconds.
              </p>
            </div>
          </div>
        )}

        {/* Criterion cards */}
        <section>
          <h2 style={{ fontFamily: serif, fontSize: "20px", color: "#0d2244", marginBottom: "12px", marginTop: 0 }}>
            Criterion Scores
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
          <div style={{ background: "#fff", borderRadius: "12px", border: "2px dashed #e8e3db", padding: "32px 24px", textAlign: "center" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "50%",
              background: "#f4f1eb", border: "1px solid #e8e3db",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0d2244" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2 style={{ fontFamily: serif, fontSize: "22px", color: "#0d2244", marginBottom: "8px", marginTop: 0 }}>
              Unlock your full analysis
            </h2>
            <p style={{ fontSize: "14px", color: "#9e9890", maxWidth: "340px", margin: "0 auto 20px", lineHeight: 1.65 }}>
              Get detailed feedback on all 5 criteria, paragraph-by-paragraph annotations, and targeted rewrite suggestions.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 auto 24px", maxWidth: "280px", display: "flex", flexDirection: "column", gap: "8px", textAlign: "left" }}>
              {[
                "All 5 criteria with scores, summaries & fixes",
                "Paragraph-by-paragraph annotations",
                "2-3 targeted rewrite suggestions",
                "Full results emailed to you",
              ].map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "14px", color: "#4a4540" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d2244" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "3px" }}>
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
                background: "#0d2244",
                color: "#f5c842",
                border: "none",
                borderRadius: "10px",
                padding: "15px",
                width: "100%",
                maxWidth: "260px",
                fontSize: "15px",
                fontWeight: 500,
                fontFamily: sans,
                cursor: checkoutLoading ? "not-allowed" : "pointer",
                opacity: checkoutLoading ? 0.6 : 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {checkoutLoading ? (
                <>
                  <span
                    className="animate-spin"
                    style={{ width: "16px", height: "16px", border: "2px solid rgba(245,200,66,0.3)", borderTopColor: "#f5c842", borderRadius: "50%", flexShrink: 0 }}
                  />
                  Redirecting to payment...
                </>
              ) : (
                "Unlock full analysis — £4.99"
              )}
            </button>
            <p style={{ fontSize: "11px", color: "#b0a898", marginTop: "10px", marginBottom: 0 }}>
              Secure payment via Stripe
            </p>
          </div>
        )}

        {/* Paragraph annotations */}
        {isPaid && paid.paragraph_annotations?.length > 0 && (
          <section>
            <h2 style={{ fontFamily: serif, fontSize: "20px", color: "#0d2244", marginBottom: "12px", marginTop: 0 }}>
              Paragraph Breakdown
            </h2>
            <ParagraphAnnotations annotations={paid.paragraph_annotations} />
          </section>
        )}

        {/* Rewrite suggestions */}
        {isPaid && paid.rewrite_suggestions?.length > 0 && (
          <section>
            <h2 style={{ fontFamily: serif, fontSize: "20px", color: "#0d2244", marginBottom: "12px", marginTop: 0 }}>
              Rewrite Suggestions
            </h2>
            <RewriteSuggestions suggestions={paid.rewrite_suggestions} />
          </section>
        )}

      </div>

      <div style={{ padding: "24px" }} />
      <FooterLinks />
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
            style={{ width: "40px", height: "40px", borderRadius: "50%", border: "4px solid rgba(13,34,68,0.1)", borderTopColor: "#0d2244" }}
          />
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
