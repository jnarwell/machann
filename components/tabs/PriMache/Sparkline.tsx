"use client";

import React, { useState, useEffect } from "react";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  trend: "up" | "down" | "stable";
  className?: string;
}

export default function Sparkline({
  data,
  width = 80,
  height = 24,
  trend,
  className = "",
}: SparklineProps) {
  // Only render on client to avoid hydration mismatch with random mock data
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Take only the last 7 days of data
  const recentData = data.slice(-7);

  if (!isMounted || recentData.length < 2) {
    // Return placeholder during SSR
    return (
      <div
        style={{ width, height }}
        className={`bg-parchment-dark/10 rounded ${className}`}
        aria-hidden="true"
      />
    );
  }

  const min = Math.min(...recentData);
  const max = Math.max(...recentData);
  const range = max - min || 1;

  // Add slight padding to avoid clipping
  const padding = 2;
  const effectiveWidth = width - padding * 2;
  const effectiveHeight = height - padding * 2;

  // Generate points with slight organic variation for hand-drawn feel
  const points = recentData.map((value, index) => {
    const x = padding + (index / (recentData.length - 1)) * effectiveWidth;
    const y =
      padding + effectiveHeight - ((value - min) / range) * effectiveHeight;

    // Add tiny random offset for organic, hand-drawn feeling (deterministic based on index)
    const seed = index * 13 + Math.floor(value);
    const offsetX = ((seed % 5) - 2) * 0.3;
    const offsetY = (((seed * 7) % 5) - 2) * 0.3;

    return { x: x + offsetX, y: y + offsetY };
  });

  // Create a smooth curve path using quadratic bezier curves
  const pathData = points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    }

    const prevPoint = points[index - 1];
    const controlX = (prevPoint.x + point.x) / 2;

    // Use quadratic bezier for smoother, more organic curves
    return `${path} Q ${prevPoint.x.toFixed(1)} ${prevPoint.y.toFixed(1)} ${controlX.toFixed(1)} ${((prevPoint.y + point.y) / 2).toFixed(1)}`;
  }, "");

  // Final line segment to the last point
  const lastPoint = points[points.length - 1];
  const secondLastPoint = points[points.length - 2];
  const finalPath = `${pathData} Q ${secondLastPoint.x.toFixed(1)} ${secondLastPoint.y.toFixed(1)} ${lastPoint.x.toFixed(1)} ${lastPoint.y.toFixed(1)}`;

  // Color based on trend
  const strokeColor =
    trend === "up"
      ? "#B83232" // alert-red
      : trend === "down"
        ? "#4A7A4A" // alert-green
        : "#D4872A"; // amber

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`sparkline ${className}`}
      aria-hidden="true"
    >
      <path
        d={finalPath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.8}
      />
      {/* End dot */}
      <circle cx={lastPoint.x} cy={lastPoint.y} r={2} fill={strokeColor} />
    </svg>
  );
}
