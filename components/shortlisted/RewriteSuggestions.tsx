"use client";

import type { RewriteSuggestion } from "@/lib/shortlisted/types";

const sans = "var(--font-inter), 'Inter', sans-serif";

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
            background: "#fff",
            border: "1px solid #e8e3db",
            borderRadius: "12px",
            padding: "20px 24px",
            boxShadow: "0 2px 16px rgba(13,34,68,0.06)",
            fontFamily: sans,
          }}
        >
          <p style={{ fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em", color: "#9e9890", marginBottom: "14px" }}>
            {s.criterion}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              padding: "12px 14px",
            }}>
              <p style={{ fontSize: "11px", fontWeight: 500, color: "#b91c1c", marginBottom: "6px" }}>
                Original
              </p>
              <p style={{ fontSize: "13px", color: "#4a4540", fontStyle: "italic", lineHeight: 1.6, margin: 0 }}>
                &ldquo;{s.original}&rdquo;
              </p>
            </div>
            <div style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "8px",
              padding: "12px 14px",
            }}>
              <p style={{ fontSize: "11px", fontWeight: 500, color: "#15803d", marginBottom: "6px" }}>
                Suggested rewrite
              </p>
              <p style={{ fontSize: "13px", color: "#1a1a1a", lineHeight: 1.6, margin: 0 }}>{s.rewrite}</p>
            </div>
          </div>
          <p style={{
            fontSize: "12px", color: "#9e9890", lineHeight: 1.6,
            marginTop: "14px", paddingTop: "14px",
            borderTop: "1px solid #f0ece4",
            marginBottom: 0,
          }}>
            {s.reason}
          </p>
        </div>
      ))}
    </div>
  );
}
