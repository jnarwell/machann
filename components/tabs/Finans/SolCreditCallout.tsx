"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SolCreditCallout() {
  const { language, t } = useLanguage();

  const content =
    language === "kr"
      ? "Istwa patisipasyon sòl ou se prèv fyab finansyè verifye — egzakteman sa modèl prè solidarite Fonkoze rekonèt. 8 kontribisyon a tan = siyal kredi fò."
      : "Your sòl participation history is verifiable proof of financial reliability — exactly what Fonkoze's solidarity lending model recognizes. 8 on-time contributions = strong credit signal.";

  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-amber-50 to-sage-50 border border-amber-200/60 p-5">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          className="w-full h-full text-amber"
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="8 4"
          />
          <circle cx="50" cy="10" r="6" fill="currentColor" />
          <circle cx="90" cy="50" r="6" fill="currentColor" />
          <circle cx="50" cy="90" r="6" fill="currentColor" />
          <circle cx="10" cy="50" r="6" fill="currentColor" />
          <circle cx="78" cy="22" r="5" fill="currentColor" />
          <circle cx="78" cy="78" r="5" fill="currentColor" />
          <circle cx="22" cy="78" r="5" fill="currentColor" />
          <circle cx="22" cy="22" r="5" fill="currentColor" />
        </svg>
      </div>

      <div className="relative flex gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-amber/20 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-amber-700"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h4 className="font-display text-base font-semibold text-amber-800 mb-2">
            {t("finans.solCredit.title")}
          </h4>
          <blockquote className="text-sm text-indigo/80 leading-relaxed italic border-l-3 border-amber-400 pl-3">
            {content}
          </blockquote>

          {/* Visual indicator of on-time contributions */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-indigo/60">
              {language === "kr" ? "Kontribisyon ou:" : "Your contributions:"}
            </span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <div
                  key={num}
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                    num <= 8
                      ? "bg-sage text-parchment-light"
                      : "bg-parchment-dark/30 text-indigo/40"
                  }`}
                >
                  {num <= 8 && (
                    <svg
                      className="w-3 h-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
            <span className="text-xs font-mono text-sage-700 font-bold">
              8/8
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
