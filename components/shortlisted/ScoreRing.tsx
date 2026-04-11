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
    if (s >= 70) return "#22c55e";
    if (s >= 50) return "#C24E2A";
    return "#ef4444";
  };

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f0e8e4"
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
            fontFamily: "Georgia, serif",
          }}
        >
          {score}
        </span>
        <span className="text-xs text-gray-400 mt-1">/ 100</span>
      </div>
    </div>
  );
}
