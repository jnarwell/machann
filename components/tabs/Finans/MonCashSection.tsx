"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Step {
  iconSvg: React.ReactNode;
  labelKr: string;
  labelEn: string;
}

const steps: Step[] = [
  {
    iconSvg: (
      <svg
        className="w-8 h-8"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
    labelKr: "Enskri",
    labelEn: "Register",
  },
  {
    iconSvg: (
      <svg
        className="w-8 h-8"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    labelKr: "Depoze lajan nan ajan",
    labelEn: "Add funds at agent",
  },
  {
    iconSvg: (
      <svg
        className="w-8 h-8"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    labelKr: "Transfere / Peye",
    labelEn: "Transfer / Pay",
  },
];

export default function MonCashSection() {
  const { language, t } = useLanguage();

  return (
    <div className="card-indigo p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        {/* MonCash-style icon */}
        <div className="w-12 h-12 bg-amber rounded-xl flex items-center justify-center">
          <svg
            className="w-7 h-7 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold text-parchment">
            {t("finans.moncash.title")}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p className="text-parchment/80 text-sm leading-relaxed">
        {t("finans.moncash.description")}
      </p>

      {/* Stats */}
      <div className="flex gap-6 py-2">
        <div className="text-center">
          <div className="font-mono text-2xl font-bold text-amber">2M+</div>
          <div className="text-xs text-parchment/60">{t("finans.moncash.users")}</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-2xl font-bold text-amber">2,000+</div>
          <div className="text-xs text-parchment/60">{t("finans.moncash.agents")}</div>
        </div>
      </div>

      {/* 3-step process */}
      <div className="pt-2">
        <div className="flex justify-between items-start">
          {steps.map((step, index) => {
            const label = language === "kr" ? step.labelKr : step.labelEn;
            return (
              <div key={index} className="flex flex-col items-center gap-2 flex-1">
                {/* Step icon */}
                <div className="w-14 h-14 rounded-full bg-parchment/10 flex items-center justify-center text-amber">
                  {step.iconSvg}
                </div>

                {/* Step number */}
                <div className="w-6 h-6 rounded-full bg-amber text-indigo text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </div>

                {/* Step label */}
                <span className="text-xs text-parchment/80 text-center">
                  {label}
                </span>

                {/* Connector line (except for last step) */}
                {index < steps.length - 1 && (
                  <div className="absolute hidden" />
                )}
              </div>
            );
          })}
        </div>

        {/* Connector lines between steps */}
        <div className="relative -mt-[4.5rem] px-12 pointer-events-none">
          <div className="flex justify-between">
            <div className="flex-1 border-t-2 border-dashed border-parchment/20 mt-7" />
            <div className="w-14" />
            <div className="flex-1 border-t-2 border-dashed border-parchment/20 mt-7" />
            <div className="w-14" />
          </div>
        </div>
      </div>
    </div>
  );
}
