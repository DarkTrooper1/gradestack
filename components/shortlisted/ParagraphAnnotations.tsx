"use client";

import type { ParagraphAnnotation } from "@/lib/shortlisted/types";

const RATING_STYLES = {
  strong: {
    dot: "#22c55e",
    badgeBg: "#f0fdf4",
    badgeBorder: "#bbf7d0",
    badgeText: "#15803d",
    cardBorder: "#dcfce7",
  },
  adequate: {
    dot: "#d97706",
    badgeBg: "#fffbeb",
    badgeBorder: "#fde68a",
    badgeText: "#b45309",
    cardBorder: "#fef3c7",
  },
  weak: {
    dot: "#dc2626",
    badgeBg: "#fef2f2",
    badgeBorder: "#fecaca",
    badgeText: "#b91c1c",
    cardBorder: "#fee2e2",
  },
};

const sans = "var(--font-inter), 'Inter', sans-serif";

interface Props {
  annotations: ParagraphAnnotation[];
}

export default function ParagraphAnnotations({ annotations }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {annotations.map((a, i) => {
        const styles = RATING_STYLES[a.rating];
        return (
          <div
            key={i}
            style={{
              background: "#fff",
              border: `1px solid ${styles.cardBorder}`,
              borderRadius: "10px",
              padding: "16px",
              fontFamily: sans,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: styles.dot, flexShrink: 0, marginTop: "4px" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "12px", color: "#b0a898" }}>
                    Para {a.paragraph_index + 1}
                  </span>
                  <span style={{
                    fontSize: "11px", fontWeight: 500, padding: "2px 8px",
                    borderRadius: "999px", textTransform: "capitalize" as const,
                    background: styles.badgeBg, border: `1px solid ${styles.badgeBorder}`, color: styles.badgeText,
                  }}>
                    {a.rating}
                  </span>
                </div>
                <p style={{ fontSize: "13px", color: "#9e9890", fontStyle: "italic", marginBottom: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  &ldquo;{a.paragraph_preview}&hellip;&rdquo;
                </p>
                <p style={{ fontSize: "14px", color: "#4a4540", lineHeight: 1.6, margin: 0 }}>{a.comment}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
