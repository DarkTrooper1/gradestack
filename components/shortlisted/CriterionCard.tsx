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

export default function CriterionCard({
  label,
  criterion,
  locked,
}: CriterionCardProps) {
  const score = criterion.score;
  const barWidth = `${(score / 10) * 100}%`;
  const scoreColour =
    score >= 7 ? "#22c55e" : score >= 5 ? "#C24E2A" : "#ef4444";

  if (locked) {
    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="font-semibold text-gray-400"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {label}
          </h3>
          <div className="flex items-center gap-2 text-gray-300">
            <LockIcon />
          </div>
        </div>
        <div className="h-2 bg-gray-200 rounded-full mb-4" />
        <p className="text-sm text-gray-400 italic">
          Unlock to see score &amp; feedback
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-orange-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3
          className="font-semibold text-gray-900"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {label}
        </h3>
        <span
          className="text-xl font-bold"
          style={{ color: scoreColour, fontFamily: "Georgia, serif" }}
        >
          {score}
          <span className="text-sm font-normal text-gray-400">/10</span>
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: barWidth, backgroundColor: scoreColour }}
        />
      </div>
      {isFull(criterion) && (
        <>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            {criterion.summary}
          </p>
          <div className="rounded-lg bg-orange-50 border border-orange-100 p-3">
            <p className="text-xs font-semibold text-[#C24E2A] uppercase tracking-wide mb-1">
              Top fix
            </p>
            <p className="text-sm text-gray-800">{criterion.top_fix}</p>
          </div>
        </>
      )}
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
