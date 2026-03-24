import { useEffect, useRef, useState } from "react";

interface Props {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  animate?: boolean;
}

export default function ScoreCircle({ score, size = 140, strokeWidth = 10, label = "Match Score", animate = true }: Props) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score);
  const [drawn, setDrawn] = useState(!animate);
  const animRef = useRef<number | null>(null);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const clampedScore = Math.max(0, Math.min(100, score));
  const offset = circumference - (clampedScore / 100) * circumference;
  const color = clampedScore < 40 ? "#EF4444" : clampedScore < 70 ? "#F59E0B" : "#10B981";

  useEffect(() => {
    if (!animate) return;
    let start: number | null = null;
    function step(ts: number) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1200, 1);
      setDisplayScore(Math.round((1 - Math.pow(1 - p, 3)) * clampedScore));
      if (p < 1) { animRef.current = requestAnimationFrame(step); } else { setDrawn(true); }
    }
    const t = setTimeout(() => { animRef.current = requestAnimationFrame(step); }, 100);
    return () => { clearTimeout(t); if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [clampedScore, animate]);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
        <circle cx={center} cy={center} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round" strokeDasharray={circumference}
          strokeDashoffset={drawn ? offset : circumference}
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: animate ? "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" : "none" }}
        />
        <text x={center} y={center - 4} textAnchor="middle" dominantBaseline="middle"
          style={{ fontFamily: "Inter,sans-serif", fontSize: size * 0.22, fontWeight: 700, fill: color }}>
          {displayScore}
        </text>
        <text x={center} y={center + size * 0.14} textAnchor="middle"
          style={{ fontFamily: "Inter,sans-serif", fontSize: size * 0.095, fill: "#6b7280" }}>
          / 100
        </text>
      </svg>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
    </div>
  );
}
