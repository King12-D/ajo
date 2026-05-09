"use client";

import { useEffect, useRef } from "react";

interface AjoScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

function getScoreLabel(score: number) {
  if (score >= 800) return { label: "Exceptional", color: "#4ade80" };
  if (score >= 740) return { label: "Very Good", color: "#a3e635" };
  if (score >= 670) return { label: "Good", color: "#facc15" };
  if (score >= 580) return { label: "Fair", color: "#fb923c" };
  return { label: "Building", color: "#f87171" };
}

const SIZES = {
  sm: { outer: 120, r: 46, strokeW: 7, textSize: "22px", labelSize: "10px" },
  md: { outer: 160, r: 62, strokeW: 8, textSize: "30px", labelSize: "11px" },
  lg: { outer: 210, r: 82, strokeW: 10, textSize: "44px", labelSize: "13px" },
};

export function AjoScore({
  score,
  size = "lg",
  animated = true,
}: AjoScoreProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const cfg = SIZES[size];
  const { label, color } = getScoreLabel(score);

  const pct = (score - 300) / (850 - 300);
  const circ = 2 * Math.PI * cfg.r;

  useEffect(() => {
    if (!animated || !circleRef.current) return;
    circleRef.current.style.strokeDashoffset = String(circ);
    const raf = requestAnimationFrame(() => {
      setTimeout(() => {
        if (circleRef.current) {
          circleRef.current.style.transition =
            "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)";
          circleRef.current.style.strokeDashoffset = String(circ - pct * circ);
        }
      }, 80);
    });
    return () => cancelAnimationFrame(raf);
  }, [score, pct, circ, animated]);

  const cx = cfg.outer / 2;
  const cy = cfg.outer / 2;
  const gradId = `sg-${size}-${score}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={cfg.outer}
        height={cfg.outer}
        viewBox={`0 0 ${cfg.outer} ${cfg.outer}`}
        role="img"
        aria-label={`Ajo Score: ${score}`}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.44 0.14 155)" />
            <stop offset="50%" stopColor={color} />
            <stop offset="100%" stopColor="oklch(0.76 0.19 75)" />
          </linearGradient>
          {/* Glow filter */}
          <filter
            id={`glow-${size}`}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={cfg.r}
          fill="none"
          stroke="oklch(0.22 0.018 155)"
          strokeWidth={cfg.strokeW}
          strokeLinecap="round"
        />

        {/* Fill arc */}
        <circle
          ref={circleRef}
          cx={cx}
          cy={cy}
          r={cfg.r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={cfg.strokeW}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={animated ? circ : circ - pct * circ}
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
          filter={`url(#glow-${size})`}
        />

        {/* Score number */}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontWeight="800"
          fontSize={cfg.textSize}
          fontFamily="var(--font-sans)"
        >
          {score}
        </text>

        {/* Label below number */}
        <text
          x={cx}
          y={cy + cfg.textSize.replace("px", "") / 1.8}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="oklch(0.58 0.015 155)"
          fontSize={cfg.labelSize}
          fontFamily="var(--font-sans)"
          fontWeight="500"
          letterSpacing="0.05em"
        >
          {label.toUpperCase()}
        </text>
      </svg>

      <p className="text-[11px] text-muted-foreground tracking-widest uppercase">
        300 &nbsp;·&nbsp; 850
      </p>
    </div>
  );
}
