"use client";

import type { RewriteSuggestion } from "@/lib/shortlisted/types";

const N = "var(--font-instrument-sans), system-ui, sans-serif";
const S = "var(--font-instrument-serif)";

interface Props {
  suggestions: RewriteSuggestion[];
}

export default function RewriteSuggestions({ suggestions }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {suggestions.map((s, i) => (
        <div
          key={i}
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "12px",
            padding: "20px 24px",
            fontFamily: N,
          }}
        >
          <p style={{ fontSize: "11px", fontWeight: 600, color: "#e8b84b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>
            {s.criterion}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div style={{
              background: "rgba(248,113,113,0.08)",
              border: "1px solid rgba(248,113,113,0.2)",
              borderRadius: "8px",
              padding: "12px 14px",
            }}>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "#f87171", marginBottom: "8px" }}>
                Original
              </p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", fontStyle: "italic", lineHeight: 1.6 }}>
                &ldquo;{s.original}&rdquo;
              </p>
            </div>
            <div style={{
              background: "rgba(74,222,128,0.08)",
              border: "1px solid rgba(74,222,128,0.2)",
              borderRadius: "8px",
              padding: "12px 14px",
            }}>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "#4ade80", marginBottom: "8px" }}>
                Suggested rewrite
              </p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>{s.rewrite}</p>
            </div>
          </div>
          <p style={{
            fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6,
            marginTop: "14px", paddingTop: "14px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}>
            {s.reason}
          </p>
        </div>
      ))}
    </div>
  );
}
