"use client";

import type { CriterionFull, CriterionFree } from "@/lib/shortlisted/types";

interface CriterionCardProps {
  label: string;
  criterion: CriterionFull | CriterionFree;
  locked: boolean;
}

function isFull(c: CriterionFull | CriterionFree): c is CriterionFull {
  return "summary" in c && "top_fix" in c;
}

const S = "var(--font-instrument-serif)";
const N = "var(--font-instrument-sans), system-ui, sans-serif";

export default function CriterionCard({ label, criterion, locked }: CriterionCardProps) {
  const score = criterion.score;
  const barWidth = `${(score / 10) * 100}%`;

  if (locked) {
    return (
      <div style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "12px",
        padding: "20px 24px",
        fontFamily: N,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h3 style={{ fontFamily: S, fontSize: "15px", color: "rgba(255,255,255,0.25)" }}>
            {label}
          </h3>
          <LockIcon />
        </div>
        <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "9999px", marginBottom: "12px" }} />
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.2)", fontStyle: "italic" }}>
          Unlock to see score &amp; feedback
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: "rgba(255,255,255,0.07)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: "12px",
      padding: "20px 24px",
      fontFamily: N,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <h3 style={{ fontFamily: S, fontSize: "15px", color: "#ffffff" }}>
          {label}
        </h3>
        <span style={{ fontFamily: S, fontSize: "20px", color: "#e8b84b" }}>
          {score}
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", fontFamily: N }}>/10</span>
        </span>
      </div>
      <div style={{ height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "9999px", marginBottom: "16px", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: barWidth,
            background: "#e8b84b",
            borderRadius: "9999px",
            transition: "width 0.7s ease",
          }}
        />
      </div>
      {isFull(criterion) && (
        <>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.65)", lineHeight: 1.65, marginBottom: "12px" }}>
            {criterion.summary}
          </p>
          <div style={{
            background: "rgba(232,184,75,0.08)",
            border: "1px solid rgba(232,184,75,0.18)",
            borderRadius: "8px",
            padding: "12px 14px",
          }}>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "#e8b84b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
              Top fix
            </p>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>{criterion.top_fix}</p>
          </div>
        </>
      )}
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgba(255,255,255,0.2)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
