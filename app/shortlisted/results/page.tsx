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

  // Fire paid analysis on mount — keepalive so it survives any navigation.
  // Ref prevents double-firing in React StrictMode.
  useEffect(() => {
    if (!sessionId || analysePaidFiredRef.current) return;
    analysePaidFiredRef.current = true;
    fetch("/shortlisted/api/analyse-paid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
      keepalive: true,
    }).catch(() => {/* ignore — paid data may already exist or will be retried */});
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

  // Initial load
  useEffect(() => {
    if (!sessionId) {
      setError("No session ID provided.");
      setLoading(false);
      return;
    }
    fetchResults();
  }, [sessionId, fetchResults]);

  // After Stripe redirects back with ?payment=success, poll until the webhook
  // has written paid_confirmed and the results route returns unlocked paid data.
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

    // Stop polling after 3 minutes
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
          <p className="text-gray-500 text-sm">Analysing your statement...</p>
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

        {/* Polling banner — shown while waiting for webhook to confirm payment */}
        {polling && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 px-5 py-4 flex items-center gap-3">
            <div className="h-5 w-5 rounded-full border-2 border-orange-300 border-t-[#C24E2A] animate-spin flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#C24E2A]">
                Unlocking your full analysis...
              </p>
              <p className="text-xs text-orange-600 mt-0.5">
                Confirming payment. This usually takes a few seconds.
              </p>
            </div>
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
              const isLocked = !isPaid && index > 0;
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

        {/* Unlock CTA — hidden while polling */}
        {!isPaid && !polling && (
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

      </div>

      <footer className="border-t border-gray-100 px-6 py-5 text-center text-xs text-gray-400">
        <p>
          <a href="/shortlisted/privacy" className="hover:text-gray-600 transition">Privacy Policy</a>
          {" · "}
          <a href="/shortlisted/terms" className="hover:text-gray-600 transition">Terms &amp; Conditions</a>
          {" · "}
          &copy; 2026 Shortlisted
        </p>
      </footer>
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
