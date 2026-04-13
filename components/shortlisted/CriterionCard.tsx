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

const serif = "var(--font-cormorant), 'Cormorant Garamond', serif";
const sans = "var(--font-inter), 'Inter', sans-serif";

export default function CriterionCard({ label, criterion, locked }: CriterionCardProps) {
  const score = criterion.score;
  const barWidth = `${(score / 10) * 100}%`;

  if (locked) {
    return (
      <div style={{
        background: "#faf9f7",
        border: "1px solid #ede9e2",
        borderRadius: "12px",
        padding: "20px 24px",
        fontFamily: sans,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h3 style={{ fontFamily: serif, fontSize: "16px", color: "#c0b8ae", margin: 0 }}>
            {label}
          </h3>
          <LockIcon />
        </div>
        <div style={{ height: "4px", background: "#f0ece4", borderRadius: "9999px", marginBottom: "12px" }} />
        <p style={{ fontSize: "13px", color: "#c0b8ae", fontStyle: "italic", margin: 0 }}>
          Unlock to see score &amp; feedback
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e8e3db",
      borderRadius: "12px",
      padding: "20px 24px",
      boxShadow: "0 2px 16px rgba(13,34,68,0.06)",
      fontFamily: sans,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <h3 style={{ fontFamily: serif, fontSize: "16px", color: "#0d2244", margin: 0 }}>
          {label}
        </h3>
        <span style={{ fontFamily: serif, fontSize: "22px", color: "#0d2244" }}>
          {score}
          <span style={{ fontSize: "12px", color: "#9e9890", fontFamily: sans }}>/10</span>
        </span>
      </div>
      <div style={{ height: "4px", background: "#f0ece4", borderRadius: "9999px", marginBottom: "16px", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: barWidth,
            background: "#0d2244",
            borderRadius: "9999px",
            transition: "width 0.7s ease",
          }}
        />
      </div>
      {isFull(criterion) && (
        <>
          <p style={{ fontSize: "14px", color: "#4a4540", lineHeight: 1.65, marginBottom: "12px" }}>
            {criterion.summary}
          </p>
          <div style={{
            background: "#f4f1eb",
            border: "1px solid #e8e3db",
            borderRadius: "8px",
            padding: "12px 14px",
          }}>
            <p style={{ fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em", color: "#9e9890", marginBottom: "4px" }}>
              Top fix
            </p>
            <p style={{ fontSize: "13px", color: "#1a1a1a", margin: 0 }}>{criterion.top_fix}</p>
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
      stroke="#c0b8ae"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
