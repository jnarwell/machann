"use client";

import React from "react";

interface LoanReadinessGaugeProps {
  score: number;
  maxScore?: number;
}

export default function LoanReadinessGauge({
  score,
  maxScore = 100,
}: LoanReadinessGaugeProps) {
  // SVG dimensions and configuration
  const size = 200;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  // Arc configuration: 220 degrees to 320 degrees (3/4 circle, bottom opening)
  // Start at 220 degrees (bottom-left), end at 320 degrees (bottom-right)
  // Total arc span: 100 degrees on each side of bottom + bottom opening
  const startAngle = 135; // Degrees from top (clockwise)
  const endAngle = 405; // 360 + 45 = end at bottom-right
  const arcSpan = endAngle - startAngle; // 270 degrees

  // Calculate the percentage for the filled arc
  const percentage = Math.min(Math.max(score / maxScore, 0), 1);

  // Convert degrees to radians and calculate arc path
  const polarToCartesian = (
    centerX: number,
    centerY: number,
    r: number,
    angleInDegrees: number
  ) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (
    x: number,
    y: number,
    r: number,
    startAng: number,
    endAng: number
  ) => {
    const start = polarToCartesian(x, y, r, endAng);
    const end = polarToCartesian(x, y, r, startAng);
    const largeArcFlag = endAng - startAng <= 180 ? "0" : "1";
    return [
      "M",
      start.x,
      start.y,
      "A",
      r,
      r,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
    ].join(" ");
  };

  // Background arc (full arc)
  const backgroundArc = describeArc(center, center, radius, startAngle, endAngle);

  // Foreground arc (filled portion based on score)
  const filledEndAngle = startAngle + arcSpan * percentage;
  const foregroundArc = describeArc(center, center, radius, startAngle, filledEndAngle);

  // Generate tick marks at 0, 25, 50, 75, 100
  const ticks = [0, 25, 50, 75, 100];
  const tickMarks = ticks.map((tickValue) => {
    const tickPercentage = tickValue / 100;
    const tickAngle = startAngle + arcSpan * tickPercentage;
    const innerRadius = radius - strokeWidth / 2 - 8;
    const outerRadius = radius - strokeWidth / 2 - 2;
    const labelRadius = radius - strokeWidth / 2 - 20;

    const inner = polarToCartesian(center, center, innerRadius, tickAngle);
    const outer = polarToCartesian(center, center, outerRadius, tickAngle);
    const label = polarToCartesian(center, center, labelRadius, tickAngle);

    return { tickValue, inner, outer, label };
  });

  // Color based on score (amber to sage gradient)
  const getScoreColor = (s: number) => {
    if (s >= 75) return "#6B7C5E"; // sage
    if (s >= 50) return "#94A882"; // sage-400
    if (s >= 25) return "#D4872A"; // amber
    return "#E9AD48"; // amber-400
  };

  const scoreColor = getScoreColor(score);

  return (
    <div className="relative flex flex-col items-center">
      <svg
        width={size}
        height={size * 0.75}
        viewBox={`0 0 ${size} ${size * 0.85}`}
        className="overflow-visible"
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E9AD48" />
            <stop offset="50%" stopColor="#D4872A" />
            <stop offset="100%" stopColor="#6B7C5E" />
          </linearGradient>
        </defs>

        {/* Background arc */}
        <path
          d={backgroundArc}
          fill="none"
          stroke="#E8DFC8"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Foreground arc (score progress) */}
        <path
          d={foregroundArc}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />

        {/* Tick marks */}
        {tickMarks.map(({ tickValue, inner, outer, label }) => (
          <g key={tickValue}>
            <line
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="#1E2A4A"
              strokeWidth={1.5}
              opacity={0.4}
            />
            <text
              x={label.x}
              y={label.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-mono text-xs fill-indigo/50"
            >
              {tickValue}
            </text>
          </g>
        ))}

        {/* Score display in center */}
        <text
          x={center}
          y={center - 5}
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-display text-5xl font-bold"
          fill={scoreColor}
        >
          {score}
        </text>
        <text
          x={center}
          y={center + 25}
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-body text-sm fill-indigo/60"
        >
          / {maxScore}
        </text>
      </svg>
    </div>
  );
}
