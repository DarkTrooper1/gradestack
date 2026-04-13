"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MIN_CHARS = 100;
const MAX_CHARS = 4000;
const WARN_CHARS = 3800;

const S = "var(--font-instrument-serif)";
const N = "var(--font-instrument-sans), system-ui, sans-serif";

export default function ShortlistedPage() {
  const router = useRouter();
  const [statement, setStatement] = useState("");
  const [email, setEmail] = useState("");
  const [optIn, setOptIn] = useState(false);
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
        body: JSON.stringify({ statement, email, optIn }),
      });
      let data: { sessionId?: string; error?: string };
      try {
        data = await res.json();
      } catch {
        throw new Error("Server returned an unexpected response. Please try again.");
      }
      if (!res.ok) throw new Error(data.error ?? "Analysis failed. Please try again.");
      router.push(`/shortlisted/results?id=${data.sessionId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setLoading(false);
    }
  }

  const charColour =
    charCount > MAX_CHARS ? "#ef4444" :
    charCount >= WARN_CHARS ? "#f59e0b" :
    charCount >= MIN_CHARS ? "#4ade80" :
    "rgba(255,255,255,0.25)";

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
        <div style={{ maxWidth: "560px", margin: "0 auto", display: "flex", alignItems: "center", gap: "12px" }}>
          <a href="/shortlisted" style={{ fontFamily: S, fontSize: "22px", color: "#ffffff", textDecoration: "none" }}>
            Shortlisted
          </a>
          <span className="hidden sm:inline" style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)" }}>
            AI feedback on your UCAS personal statement
          </span>
        </div>
      </header>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "56px 24px 40px" }}>
        <div style={{ width: "100%", maxWidth: "520px" }}>

          {/* Pill badge */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "999px", padding: "6px 16px",
              fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em",
              textTransform: "uppercase" as const, color: "rgba(255,255,255,0.6)",
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#e8b84b", flexShrink: 0 }} />
              UCAS Personal Statement Review
            </span>
          </div>

          {/* H1 */}
          <h1 style={{
            fontFamily: S,
            fontSize: "clamp(34px, 6vw, 42px)",
            fontWeight: 400,
            lineHeight: 1.15,
            textAlign: "center",
            marginBottom: "16px",
            color: "#ffffff",
          }}>
            Is your statement{" "}
            <em style={{ color: "#e8b84b", fontStyle: "italic" }}>good enough?</em>
          </h1>

          {/* Subheading */}
          <p style={{
            fontSize: "14px", color: "rgba(255,255,255,0.45)",
            textAlign: "center", lineHeight: 1.65, marginBottom: "40px",
          }}>
            Paste your UCAS personal statement below for an honest, expert-level AI review
            — scored the way a competitive admissions tutor reads it.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Email */}
            <div>
              <label
                htmlFor="sl-email"
                style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.7)", marginBottom: "8px" }}
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
                className="sl-input"
                style={{ fontFamily: N, fontSize: "14px" }}
              />
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: "6px" }}>
                Your full results will be emailed here after purchase.
              </p>
            </div>

            {/* Email opt-in */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <input
                id="sl-optin"
                type="checkbox"
                checked={optIn}
                onChange={(e) => setOptIn(e.target.checked)}
                style={{ marginTop: "2px", width: "16px", height: "16px", cursor: "pointer", accentColor: "#e8b84b", flexShrink: 0 }}
              />
              <label
                htmlFor="sl-optin"
                style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", cursor: "pointer", lineHeight: 1.5 }}
              >
                Send me tips to improve my personal statement (optional)
              </label>
            </div>

            {/* Textarea */}
            <div>
              <label
                htmlFor="sl-statement"
                style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.7)", marginBottom: "8px" }}
              >
                Your personal statement
              </label>
              <textarea
                id="sl-statement"
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="Paste your personal statement here..."
                rows={16}
                className="sl-input"
                style={{ fontFamily: "monospace", fontSize: "13px", lineHeight: 1.6, resize: "none" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 500, color: charColour, fontVariantNumeric: "tabular-nums" }}>
                  {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
                </span>
                {charCount < MIN_CHARS && charCount > 0 && (
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
                    {MIN_CHARS - charCount} more to go
                  </span>
                )}
                {charCount > MAX_CHARS && (
                  <span style={{ fontSize: "12px", color: "#ef4444" }}>
                    {charCount - MAX_CHARS} over limit
                  </span>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "8px", padding: "12px 16px", fontSize: "14px", color: "#fca5a5",
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <div style={{ paddingTop: "4px" }}>
              <button
                type="submit"
                disabled={!canSubmit}
                style={{
                  width: "100%",
                  background: "#e8b84b",
                  color: "#0d1f3c",
                  border: "none",
                  borderRadius: "8px",
                  padding: "16px 24px",
                  fontSize: "15px",
                  fontWeight: 600,
                  fontFamily: N,
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  opacity: canSubmit ? 1 : 0.4,
                  transition: "opacity 0.15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {loading ? (
                  <>
                    <Spinner />
                    Analysing your statement...
                  </>
                ) : (
                  "Analyse my statement"
                )}
              </button>
              <p style={{ textAlign: "center", fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: "10px" }}>
                First criterion free.&nbsp; Full analysis £4.99.
              </p>
            </div>
          </form>

          {/* Stats row */}
          <div style={{
            marginTop: "52px",
            paddingTop: "32px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
          }}>
            {[
              { value: "5", label: "scored criteria" },
              { value: "£4.99", label: "full analysis" },
              { value: "48h", label: "results stored" },
            ].map((stat, i) => (
              <div key={stat.label} style={{
                textAlign: "center",
                borderRight: i < 2 ? "1px solid rgba(255,255,255,0.08)" : undefined,
                padding: "0 12px",
              }}>
                <p style={{ fontFamily: S, fontSize: "26px", color: "#ffffff", marginBottom: "4px", lineHeight: 1 }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "20px 24px", textAlign: "center" }}>
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

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
