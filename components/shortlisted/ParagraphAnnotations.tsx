"use client";

import type { ParagraphAnnotation } from "@/lib/shortlisted/types";

const RATING_STYLES = {
  strong: {
    dot: "#4ade80",
    badgeBg: "rgba(74,222,128,0.12)",
    badgeBorder: "rgba(74,222,128,0.25)",
    badgeText: "#4ade80",
    cardBorder: "rgba(74,222,128,0.15)",
  },
  adequate: {
    dot: "#fbbf24",
    badgeBg: "rgba(251,191,36,0.12)",
    badgeBorder: "rgba(251,191,36,0.25)",
    badgeText: "#fbbf24",
    cardBorder: "rgba(251,191,36,0.15)",
  },
  weak: {
    dot: "#f87171",
    badgeBg: "rgba(248,113,113,0.12)",
    badgeBorder: "rgba(248,113,113,0.25)",
    badgeText: "#f87171",
    cardBorder: "rgba(248,113,113,0.15)",
  },
};

const N = "var(--font-instrument-sans), system-ui, sans-serif";

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
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${styles.cardBorder}`,
              borderRadius: "10px",
              padding: "16px",
              fontFamily: N,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: styles.dot, flexShrink: 0, marginTop: "4px" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
                    Para {a.paragraph_index + 1}
                  </span>
                  <span style={{
                    fontSize: "11px", fontWeight: 600, padding: "2px 8px",
                    borderRadius: "999px", textTransform: "capitalize" as const,
                    background: styles.badgeBg, border: `1px solid ${styles.badgeBorder}`, color: styles.badgeText,
                  }}>
                    {a.rating}
                  </span>
                </div>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", fontStyle: "italic", marginBottom: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  &ldquo;{a.paragraph_preview}&hellip;&rdquo;
                </p>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>{a.comment}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
