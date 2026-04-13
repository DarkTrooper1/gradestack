"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MIN_CHARS = 100;
const MAX_CHARS = 4000;
const WARN_CHARS = 3800;

export default function ShortlistedPage() {
  const router = useRouter();
  const [statement, setStatement] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const charCount = statement.length;
  const canSubmit =
    charCount >= MIN_CHARS &&
    charCount <= MAX_CHARS &&
    email.includes("@") &&
    !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/shortlisted/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statement, email }),
      });
      let data: { sessionId?: string; error?: string };
      try {
        data = await res.json();
      } catch {
        throw new Error("Server returned an unexpected response. Please try again.");
      }
      if (!res.ok) throw new Error(data.error ?? "Analysis failed. Please try again.");

      // Fire paid analysis in background — don't await, user proceeds immediately
      fetch("/shortlisted/api/analyse-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: data.sessionId }),
      }).catch(() => {/* silently ignore — paid analysis can still run via retry */});

      router.push(`/shortlisted/results?id=${data.sessionId}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
      setLoading(false);
    }
  }

  const charColour =
    charCount > MAX_CHARS
      ? "text-red-500"
      : charCount >= WARN_CHARS
      ? "text-amber-500"
      : charCount >= MIN_CHARS
      ? "text-green-600"
      : "text-gray-400";

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 px-6 py-5">
        <div className="max-w-3xl mx-auto flex items-baseline gap-3">
          <a
            href="/shortlisted"
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "Georgia, serif", color: "inherit", textDecoration: "none" }}
          >
            Shortlisted
          </a>
          <span className="text-sm text-gray-400 hidden sm:inline">
            AI feedback on your UCAS personal statement
          </span>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12 text-center">
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-4"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Is your personal statement
            <br />
            <span style={{ color: "#C24E2A" }}>good enough?</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Paste your UCAS personal statement below for an honest, expert-level
            AI review - scored the way a competitive admissions tutor reads it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label
              htmlFor="sl-email"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Your email address
            </label>
            <input
              id="sl-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C24E2A] focus:border-transparent transition"
            />
            <p className="text-xs text-gray-400 mt-1">
              Your full results will be emailed here after purchase.
            </p>
          </div>

          {/* Textarea */}
          <div>
            <label
              htmlFor="sl-statement"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Your personal statement
            </label>
            <textarea
              id="sl-statement"
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="Paste your personal statement here…"
              rows={16}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#C24E2A] focus:border-transparent transition resize-none font-mono"
            />
            <div className="flex items-center justify-between mt-1.5">
              <span className={`text-xs font-medium tabular-nums ${charColour}`}>
                {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
              </span>
              {charCount < MIN_CHARS && charCount > 0 && (
                <span className="text-xs text-gray-400">
                  {MIN_CHARS - charCount} more to go
                </span>
              )}
              {charCount > MAX_CHARS && (
                <span className="text-xs text-red-500">
                  {charCount - MAX_CHARS} over limit
                </span>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-xl py-4 px-6 text-base font-semibold text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#C24E2A" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner />
                  Analysing your statement…
                </span>
              ) : (
                "Analyse my statement"
              )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
              First criterion free.&nbsp; Full analysis £4.99.
            </p>
          </div>
        </form>

        {/* Trust signals */}
        <div className="mt-16 pt-8 border-t border-gray-100 grid grid-cols-3 gap-6 text-center">
          <div>
            <p
              className="text-2xl font-bold text-gray-900 mb-1"
              style={{ fontFamily: "Georgia, serif" }}
            >
              5
            </p>
            <p className="text-xs text-gray-500">scored criteria</p>
          </div>
          <div>
            <p
              className="text-2xl font-bold text-gray-900 mb-1"
              style={{ fontFamily: "Georgia, serif" }}
            >
              £4.99
            </p>
            <p className="text-xs text-gray-500">full analysis</p>
          </div>
          <div>
            <p
              className="text-2xl font-bold text-gray-900 mb-1"
              style={{ fontFamily: "Georgia, serif" }}
            >
              48h
            </p>
            <p className="text-xs text-gray-500">results stored</p>
          </div>
        </div>
      </div>
    </main>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
