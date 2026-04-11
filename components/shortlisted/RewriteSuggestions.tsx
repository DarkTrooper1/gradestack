"use client";

import type { RewriteSuggestion } from "@/lib/shortlisted/types";

interface Props {
  suggestions: RewriteSuggestion[];
}

export default function RewriteSuggestions({ suggestions }: Props) {
  return (
    <div className="space-y-4">
      {suggestions.map((s, i) => (
        <div
          key={i}
          className="rounded-xl border border-orange-100 bg-white p-5 shadow-sm"
        >
          <p className="text-xs font-semibold text-[#C24E2A] uppercase tracking-wide mb-3">
            {s.criterion}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-red-50 border border-red-100 p-3">
              <p className="text-xs font-semibold text-red-600 mb-1.5">
                Original
              </p>
              <p className="text-sm text-gray-700 italic">&ldquo;{s.original}&rdquo;</p>
            </div>
            <div className="rounded-lg bg-green-50 border border-green-100 p-3">
              <p className="text-xs font-semibold text-green-600 mb-1.5">
                Suggested rewrite
              </p>
              <p className="text-sm text-gray-700">{s.rewrite}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 border-t border-gray-100 pt-3">
            {s.reason}
          </p>
        </div>
      ))}
    </div>
  );
}
