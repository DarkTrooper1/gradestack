"use client";

interface ScoreRingProps {
  score: number; // 0–100
  size?: number;
}

export default function ScoreRing({ score, size = 160 }: ScoreRingProps) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColour = (s: number) => {
    if (s >= 70) return "#4ade80";
    if (s >= 50) return "#e8b84b";
    return "#f87171";
  };

  return (
    <div
      className="relative inline-flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={10}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColour(score)}
          strokeWidth={10}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-bold leading-none"
          style={{
            fontSize: size * 0.28,
            color: getColour(score),
            fontFamily: "var(--font-instrument-serif)",
          }}
        >
          {score}
        </span>
        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", marginTop: "4px" }}>/ 100</span>
      </div>
    </div>
  );
}
