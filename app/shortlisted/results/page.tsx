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

// Status of the post-payment analysis stream
type AnalysisStatus = "idle" | "waiting" | "streaming" | "done" | "error";

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
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>("idle");
  const [analysisError, setAnalysisError] = useState("");
  const runningRef = useRef(false);

  // Load existing results from Redis on mount
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
      if (data.paid) setPaid(data.paid);
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

  // After Stripe redirects back with ?payment=success, trigger the analysis stream.
  // We wait briefly for the webhook to write paid_confirmed to Redis, then call
  // /shortlisted/api/run-analysis which streams the Claude response back.
  useEffect(() => {
    if (!paymentSuccess || !sessionId || paid || runningRef.current) return;

    async function runAnalysis() {
      runningRef.current = true;
      setAnalysisStatus("waiting");

      // Poll until paid_confirmed is set by the webhook (up to 15s)
      let confirmed = false;
      for (let i = 0; i < 15; i++) {
        try {
          const check = await fetch(
            `/shortlisted/api/results?id=${sessionId}`
          );
          if (check.ok) {
            const data = await check.json();
            // If paid already exists (e.g. from a retry), use it directly
            if (data.paid) {
              setPaid(data.paid);
              setAnalysisStatus("done");
              router.replace(`/shortlisted/results?id=${sessionId}`);
              return;
            }
          }
          // Check paid_confirmed via a lightweight endpoint
          const confirmRes = await fetch(
            `/shortlisted/api/run-analysis`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId, checkOnly: true }),
            }
          );
          if (confirmRes.status !== 403) {
            confirmed = true;
            break;
          }
        } catch {
          // keep trying
        }
        await new Promise((r) => setTimeout(r, 1000));
      }

      if (!confirmed) {
        setAnalysisStatus("error");
        setAnalysisError(
          "Payment confirmation timed out. Please refresh — your results will appear shortly."
        );
        return;
      }

      setAnalysisStatus("streaming");

      try {
        const res = await fetch("/shortlisted/api/run-analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        if (!res.ok || !res.body) {
          throw new Error("Failed to start analysis stream");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // Parse SSE lines
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const msg = JSON.parse(line.slice(6));
              if (msg.type === "done" && msg.analysis) {
                setPaid(msg.analysis);
                setAnalysisStatus("done");
                router.replace(`/shortlisted/results?id=${sessionId}`);
                return;
              }
              if (msg.type === "error") {
                throw new Error(msg.message);
              }
              // msg.type === "progress" — keep spinner going, no action needed
            } catch (parseErr) {
              if (parseErr instanceof SyntaxError) continue;
              throw parseErr;
            }
          }
        }
      } catch (err) {
        console.error("run-analysis stream error:", err);
        setAnalysisStatus("error");
        setAnalysisError(
          err instanceof Error
            ? err.message
            : "Analysis failed. Please refresh the page."
        );
      }
    }

    runAnalysis();
  }, [paymentSuccess, sessionId, paid, router]);

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
      alert(
        err instanceof Error ? err.message : "Checkout failed. Please try again."
      );
      setCheckoutLoading(false);
    }
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No session found.</p>
          <a href="/shortlisted" className="text-[#C24E2A] underline text-sm">
            Start a new analysis
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-orange-100 border-t-[#C24E2A] animate-spin" />
          <p className="text-gray-500 text-sm">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <p className="text-red-600 mb-4">{error}</p>
          <a href="/shortlisted" className="text-[#C24E2A] underline text-sm">
            Start a new analysis
          </a>
        </div>
      </div>
    );
  }

  if (!free) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-500">No results found.</p>
        </div>
      </div>
    );
  }

  const analysis = paid ?? free;
  const isPaid = !!paid;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <a
            href="/shortlisted"
            className="text-xl font-bold tracking-tight"
            style={{ fontFamily: "Georgia, serif", color: "inherit", textDecoration: "none" }}
          >
            Shortlisted
          </a>
          <a
            href="/shortlisted"
            className="text-sm text-gray-500 hover:text-gray-700 transition"
          >
            New analysis
          </a>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        {/* Overall score card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <ScoreRing score={analysis.overall_score} size={160} />
            <div className="flex-1 text-center sm:text-left">
              <h1
                className="text-2xl font-bold text-gray-900 mb-2"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Your Results
              </h1>
              <p className="text-base font-semibold text-gray-800 mb-2">
                {analysis.overall_verdict}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {analysis.overall_summary}
              </p>
            </div>
          </div>
        </div>

        {/* Post-payment analysis progress banner */}
        {(analysisStatus === "waiting" || analysisStatus === "streaming") && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 px-5 py-4 flex items-center gap-3">
            <div className="h-5 w-5 rounded-full border-2 border-orange-300 border-t-[#C24E2A] animate-spin flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#C24E2A]">
                {analysisStatus === "waiting"
                  ? "Confirming payment..."
                  : "Analysing your statement..."}
              </p>
              <p className="text-xs text-orange-600 mt-0.5">
                {analysisStatus === "waiting"
                  ? "Just a moment while we verify your payment."
                  : "Generating detailed feedback across all 5 criteria. This takes about 30 seconds."}
              </p>
            </div>
          </div>
        )}

        {/* Analysis error banner */}
        {analysisStatus === "error" && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm font-semibold text-red-700">
              Something went wrong
            </p>
            <p className="text-xs text-red-600 mt-0.5">{analysisError}</p>
            <button
              onClick={() => {
                runningRef.current = false;
                setAnalysisStatus("idle");
                setAnalysisError("");
                // Re-trigger by re-mounting the effect
                window.location.reload();
              }}
              className="mt-2 text-xs text-red-700 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Criterion cards */}
        <section>
          <h2
            className="text-lg font-semibold text-gray-900 mb-4"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Criterion Scores
          </h2>
          <div className="space-y-4">
            {CRITERIA_ORDER.map(({ key, label }, index) => {
              const criterion = analysis.criteria[key as CriteriaKey];
              const isLocked =
                !isPaid &&
                index > 0 &&
                analysisStatus !== "streaming" &&
                analysisStatus !== "waiting";
              return (
                <CriterionCard
                  key={key}
                  label={label}
                  criterion={criterion}
                  locked={isLocked}
                />
              );
            })}
          </div>
        </section>

        {/* Unlock CTA — hidden while analysis is in progress */}
        {!isPaid &&
          analysisStatus !== "waiting" &&
          analysisStatus !== "streaming" && (
            <div className="rounded-2xl border-2 border-dashed border-orange-200 bg-white p-8 text-center">
              <div className="mb-4">
                <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-50">
                  <svg
                    className="h-6 w-6 text-[#C24E2A]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 11V7a4 4 0 018 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2
                  className="text-xl font-bold text-gray-900 mb-2"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Unlock your full analysis
                </h2>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  Get detailed feedback on all 5 criteria, paragraph-by-paragraph
                  annotations, and targeted rewrite suggestions.
                </p>
              </div>
              <ul className="text-sm text-gray-700 space-y-2 mb-6 text-left max-w-xs mx-auto">
                {[
                  "All 5 criteria with scores, summaries & fixes",
                  "Paragraph-by-paragraph annotations",
                  "2-3 targeted rewrite suggestions",
                  "Full results emailed to you",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <svg
                      className="h-4 w-4 text-[#C24E2A] mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleUnlock}
                disabled={checkoutLoading}
                className="w-full max-w-xs rounded-xl py-4 px-6 text-base font-semibold text-white transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#C24E2A" }}
              >
                {checkoutLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Redirecting to payment...
                  </span>
                ) : (
                  "Unlock full analysis - £4.99"
                )}
              </button>
              <p className="text-xs text-gray-400 mt-3">
                Secure payment via Stripe
              </p>
            </div>
          )}

        {/* Paragraph annotations */}
        {isPaid && paid.paragraph_annotations?.length > 0 && (
          <section>
            <h2
              className="text-lg font-semibold text-gray-900 mb-4"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Paragraph Breakdown
            </h2>
            <ParagraphAnnotations annotations={paid.paragraph_annotations} />
          </section>
        )}

        {/* Rewrite suggestions */}
        {isPaid && paid.rewrite_suggestions?.length > 0 && (
          <section>
            <h2
              className="text-lg font-semibold text-gray-900 mb-4"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Rewrite Suggestions
            </h2>
            <RewriteSuggestions suggestions={paid.rewrite_suggestions} />
          </section>
        )}

        {/* Footer */}
        <div className="pb-8 text-center text-xs text-gray-400">
          <p>Results stored for 48 hours · Powered by Claude AI</p>
        </div>
      </div>
    </main>
  );
}

export default function ShortlistedResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border-4 border-orange-100 border-t-[#C24E2A] animate-spin" />
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
