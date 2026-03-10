"use client";

import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "sage" | "amber" | "red" | "green" | "gray";
  className?: string;
}

export function Badge({ children, variant = "sage", className = "" }: BadgeProps) {
  const baseStyles = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium";

  const variantStyles = {
    sage: "bg-sage/20 text-sage-700",
    amber: "bg-amber/20 text-amber-700",
    red: "bg-alert-red/20 text-alert-red",
    green: "bg-alert-green/20 text-alert-green",
    gray: "bg-indigo/10 text-indigo/60",
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
