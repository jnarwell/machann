"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "indigo";
}

export function Card({ children, className = "", variant = "default" }: CardProps) {
  const baseStyles = "rounded-lg shadow-md p-4";
  const variantStyles = {
    default: "bg-parchment-light border border-parchment-dark/30",
    indigo: "bg-indigo text-parchment",
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
}
