"use client";

import type { ParagraphAnnotation } from "@/lib/shortlisted/types";

const RATING_STYLES = {
  strong: {
    badge: "bg-green-100 text-green-700",
    border: "border-green-200",
    dot: "bg-green-500",
  },
  adequate: {
    badge: "bg-yellow-100 text-yellow-700",
    border: "border-yellow-200",
    dot: "bg-yellow-500",
  },
  weak: {
    badge: "bg-red-100 text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
  },
};

interface Props {
  annotations: ParagraphAnnotation[];
}

export default function ParagraphAnnotations({ annotations }: Props) {
  return (
    <div className="space-y-3">
      {annotations.map((a, i) => {
        const styles = RATING_STYLES[a.rating];
        return (
          <div
            key={i}
            className={`rounded-lg border p-4 ${styles.border} bg-white`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${styles.dot}`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs text-gray-400">
                    Para {a.paragraph_index + 1}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${styles.badge}`}
                  >
                    {a.rating}
                  </span>
                </div>
                <p className="text-sm text-gray-500 italic mb-1.5 truncate">
                  &ldquo;{a.paragraph_preview}&hellip;&rdquo;
                </p>
                <p className="text-sm text-gray-800">{a.comment}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
