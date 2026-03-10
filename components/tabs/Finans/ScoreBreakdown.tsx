"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ScoreComponent {
  labelKr: string;
  labelEn: string;
  score: number;
  maxScore: number;
  descriptionKr?: string;
  descriptionEn?: string;
}

interface ScoreBreakdownProps {
  components?: ScoreComponent[];
}

const defaultComponents: ScoreComponent[] = [
  {
    labelKr: "Istwa komès",
    labelEn: "Trade history",
    score: 18,
    maxScore: 25,
    descriptionKr: "komès anrejistre",
    descriptionEn: "logged trades",
  },
  {
    labelKr: "Patisipasyon sòl",
    labelEn: "Sòl participation",
    score: 20,
    maxScore: 25,
    descriptionKr: "peman a tan",
    descriptionEn: "on-time payments",
  },
  {
    labelKr: "Regilarite",
    labelEn: "Consistency",
    score: 22,
    maxScore: 25,
    descriptionKr: "aktivite regilye",
    descriptionEn: "regular activity",
  },
  {
    labelKr: "Rezèv",
    labelEn: "Savings buffer",
    score: 14,
    maxScore: 25,
    descriptionKr: "okazyon pou amelyore",
    descriptionEn: "opportunity to improve",
  },
];

export default function ScoreBreakdown({
  components = defaultComponents,
}: ScoreBreakdownProps) {
  const { language } = useLanguage();

  const getBarColor = (score: number, maxScore: number) => {
    const percentage = score / maxScore;
    if (percentage >= 0.8) return "bg-sage";
    if (percentage >= 0.6) return "bg-sage-400";
    if (percentage >= 0.4) return "bg-amber";
    return "bg-amber-400";
  };

  const getTextColor = (score: number, maxScore: number) => {
    const percentage = score / maxScore;
    if (percentage >= 0.8) return "text-sage-700";
    if (percentage >= 0.6) return "text-sage-600";
    if (percentage >= 0.4) return "text-amber-700";
    return "text-amber-600";
  };

  return (
    <div className="space-y-3">
      {components.map((component, index) => {
        const label = language === "kr" ? component.labelKr : component.labelEn;
        const description =
          language === "kr" ? component.descriptionKr : component.descriptionEn;
        const percentage = (component.score / component.maxScore) * 100;

        return (
          <div key={index} className="space-y-1">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-body text-indigo">{label}</span>
              <span
                className={`text-sm font-mono font-semibold ${getTextColor(
                  component.score,
                  component.maxScore
                )}`}
              >
                {component.score}/{component.maxScore}
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-parchment-dark/40 rounded-full overflow-hidden">
              <div
                className={`h-full ${getBarColor(
                  component.score,
                  component.maxScore
                )} rounded-full transition-all duration-500 ease-out`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Optional description */}
            {description && (
              <p className="text-xs text-indigo/50 italic">{description}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
