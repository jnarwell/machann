"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import LoanReadinessGauge from "./LoanReadinessGauge";
import ScoreBreakdown from "./ScoreBreakdown";
import LoanProgramCards from "./LoanProgramCards";
import MonCashSection from "./MonCashSection";
import LoanCalculator from "./LoanCalculator";
import SolCreditCallout from "./SolCreditCallout";

export default function FinansTab() {
  const { t } = useLanguage();

  // Mock score data
  const currentScore = 74;

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="font-display text-2xl text-indigo font-bold">
          {t("finans.title")}
        </h2>
      </div>

      {/* Hero: Loan Readiness Score Card */}
      <div className="card p-6 space-y-6">
        <h3 className="font-display text-lg text-indigo font-semibold text-center">
          {t("finans.loanScore")}
        </h3>

        {/* Gauge and Breakdown side by side on larger screens */}
        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Gauge */}
          <div className="flex justify-center">
            <LoanReadinessGauge score={currentScore} />
          </div>

          {/* Score Breakdown */}
          <div>
            <ScoreBreakdown />
          </div>
        </div>

        {/* Qualification Banner */}
        <div className="bg-alert-green/10 border border-alert-green/30 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-alert-green/20 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-alert-green"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="font-body text-alert-green font-medium">
              {t("finans.qualify")}
            </span>
          </div>

          <a
            href="https://fonkoze.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta hover:bg-terracotta-600 text-parchment-light rounded-lg font-body text-sm font-medium transition-colors"
          >
            {t("finans.contactFonkoze")}
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
      </div>

      {/* Loan Programs */}
      <LoanProgramCards />

      {/* MonCash Integration */}
      <MonCashSection />

      {/* Sol Credit Callout */}
      <SolCreditCallout />

      {/* Loan Calculator */}
      <LoanCalculator />
    </div>
  );
}

// Re-export individual components for flexibility
export { default as LoanReadinessGauge } from "./LoanReadinessGauge";
export { default as ScoreBreakdown } from "./ScoreBreakdown";
export { default as LoanProgramCards } from "./LoanProgramCards";
export { default as MonCashSection } from "./MonCashSection";
export { default as LoanCalculator } from "./LoanCalculator";
export { default as SolCreditCallout } from "./SolCreditCallout";
