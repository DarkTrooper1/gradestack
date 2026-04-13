"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MIN_CHARS = 100;
const MAX_CHARS = 4000;
const WARN_CHARS = 3800;

const serif = "var(--font-cormorant), 'Cormorant Garamond', serif";
const sans = "var(--font-inter), 'Inter', sans-serif";

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
    charCount > MAX_CHARS ? "#ee5533" :
    charCount >= WARN_CHARS ? "#d97706" :
    charCount >= MIN_CHARS ? "#22c55e" :
    "#ccc";

  const inputStyle: React.CSSProperties = {
    background: "#faf9f7",
    border: "1.5px solid #ede9e2",
    color: "#1a1a1a",
    padding: "11px 14px",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: sans,
    width: "100%",
    display: "block",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <main style={{ minHeight: "100vh", fontFamily: sans }}>

      {/* Nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 40px" }}>
        <a href="/shortlisted" style={{ fontFamily: serif, fontSize: "22px", fontWeight: 600, color: "#fff", textDecoration: "none" }}>
          Shortlisted
        </a>
        <span style={{
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "rgba(255,255,255,0.6)",
          fontSize: "11px",
          padding: "4px 12px",
          borderRadius: "100px",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}>
          AI-powered
        </span>
      </div>

      {/* Hero text */}
      <div style={{ textAlign: "center", padding: "36px 40px 60px" }}>
        <h1 style={{
          fontFamily: serif,
          fontSize: "52px",
          fontWeight: 600,
          color: "#fff",
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
          marginBottom: "16px",
          margin: "0 0 16px",
        }}>
          Is your statement<br />
          <em style={{ fontStyle: "italic", color: "#f5c842" }}>good enough?</em>
        </h1>
        <p style={{
          color: "rgba(255,255,255,0.5)",
          fontSize: "14px",
          lineHeight: 1.7,
          maxWidth: "380px",
          margin: "0 auto",
          fontWeight: 300,
        }}>
          Paste your UCAS personal statement below for an honest, expert-level AI review
          — scored the way a competitive admissions tutor reads it.
        </p>
      </div>

      {/* Form card */}
      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "0 24px" }}>
      <div style={{
        background: "#fff",
        borderRadius: "16px",
        padding: "32px",
        border: "1px solid #e8e3db",
        boxShadow: "0 4px 40px rgba(13,34,68,0.10)",
        position: "relative",
        zIndex: 2,
      }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Email */}
          <div>
            <label
              htmlFor="sl-email"
              style={{ display: "block", fontSize: "11px", fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", color: "#9e9890", marginBottom: "8px" }}
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
              style={inputStyle}
            />
            <p style={{ fontSize: "12px", color: "#b0a898", marginTop: "6px", marginBottom: 0 }}>
              Your full results will be emailed here after purchase.
            </p>
          </div>

          {/* Opt-in */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <input
              id="sl-optin"
              type="checkbox"
              checked={optIn}
              onChange={(e) => setOptIn(e.target.checked)}
              style={{ marginTop: "2px", width: "16px", height: "16px", cursor: "pointer", accentColor: "#0d2244", flexShrink: 0 }}
            />
            <label
              htmlFor="sl-optin"
              style={{ fontSize: "13px", color: "#9e9890", cursor: "pointer", lineHeight: 1.5 }}
            >
              Send me tips to improve my personal statement (optional)
            </label>
          </div>

          {/* Textarea */}
          <div>
            <label
              htmlFor="sl-statement"
              style={{ display: "block", fontSize: "11px", fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", color: "#9e9890", marginBottom: "8px" }}
            >
              Your personal statement
            </label>
            <textarea
              id="sl-statement"
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="Paste your personal statement here..."
              style={{ ...inputStyle, height: "120px", resize: "none", color: "#bbb" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 500, color: charColour, fontVariantNumeric: "tabular-nums" }}>
                {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
              </span>
              {charCount < MIN_CHARS && charCount > 0 && (
                <span style={{ fontSize: "12px", color: "#b0a898" }}>
                  {MIN_CHARS - charCount} more to go
                </span>
              )}
              {charCount > MAX_CHARS && (
                <span style={{ fontSize: "12px", color: "#ee5533" }}>
                  {charCount - MAX_CHARS} over limit
                </span>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: "#fff5f5",
              border: "1px solid #fcc",
              borderRadius: "8px",
              padding: "12px 14px",
              fontSize: "13px",
              color: "#c00",
            }}>
              {error}
            </div>
          )}

          {/* CTA */}
          <div>
            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                background: "#0d2244",
                color: "#f5c842",
                border: "none",
                borderRadius: "10px",
                padding: "15px",
                width: "100%",
                fontSize: "15px",
                fontWeight: 500,
                fontFamily: "Inter, sans-serif",
                cursor: canSubmit ? "pointer" : "not-allowed",
                opacity: canSubmit ? 1 : 0.45,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                appearance: "none",
                WebkitAppearance: "none",
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
            <p style={{ textAlign: "center", fontSize: "12px", color: "#bbb", marginTop: "10px", marginBottom: 0 }}>
              First criterion free · Full analysis £4.99
            </p>
          </div>
        </form>
      </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", justifyContent: "center", gap: "48px", padding: "32px" }}>
        {[
          { value: "5", label: "scored criteria" },
          { value: "£4.99", label: "full analysis" },
          { value: "48h", label: "results stored" },
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: "center" }}>
            <p style={{ fontFamily: serif, fontSize: "26px", fontWeight: 600, color: "#0d2244", margin: 0, lineHeight: 1 }}>
              {stat.value}
            </p>
            <p style={{ fontSize: "10px", color: "#b0a898", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "2px", marginBottom: 0 }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "0 20px 24px" }}>
        <p style={{ margin: 0 }}>
          <a href="/shortlisted/privacy" style={{ fontSize: "11px", color: "#a09890", textDecoration: "none", margin: "0 8px" }}>Privacy Policy</a>
          <a href="/shortlisted/terms" style={{ fontSize: "11px", color: "#a09890", textDecoration: "none", margin: "0 8px" }}>Terms &amp; Conditions</a>
          <span style={{ fontSize: "11px", color: "#a09890", margin: "0 8px" }}>&copy; 2026 Shortlisted</span>
        </p>
      </footer>

    </main>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
