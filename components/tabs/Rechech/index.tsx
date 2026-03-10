"use client";

import { useState, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import ResearchQuestion from "./ResearchQuestion";
import PrimaryArtifact from "./PrimaryArtifact";
import ComparativeCases from "./ComparativeCases";
import HaitianContext from "./HaitianContext";
import Bibliography from "./Bibliography";

// FEWS NET Haiti data CSV URL (68,000+ records since 2005)
const FEWSNET_CSV_URL = "https://fdw.fews.net/api/marketpricefacts/?country_code=HT&format=csv";

export default function RechechTab() {
  const { language, t } = useLanguage();
  const [isDownloading, setIsDownloading] = useState(false);

  // Download full FEWS NET CSV data
  const handleDownloadCSV = useCallback(() => {
    setIsDownloading(true);
    // Open in new tab - FEWS NET serves CSV directly
    window.open(FEWSNET_CSV_URL, "_blank");
    setTimeout(() => setIsDownloading(false), 1000);
  }, []);

  return (
    <article className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* Page Header */}
      <header className="mb-12 md:mb-16 text-center">
        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-indigo mb-4">
          {t("rechech.title")}
        </h1>
        <div className="w-24 h-1 bg-terracotta mx-auto rounded-full" />
      </header>

      {/* Data Sources Section */}
      <section className="mb-12 card p-6">
        <h2 className="font-display text-xl font-semibold text-indigo mb-4">
          {language === "kr" ? "Sous Done" : "Data Sources"}
        </h2>
        <p className="text-indigo/70 text-sm mb-4">
          {language === "kr"
            ? "Done pri manje yo soti nan FEWS NET (Famine Early Warning Systems Network). Done sa yo kolekte chak mwa nan 10 mache atravè Ayiti depi 2005."
            : "Food price data sourced from FEWS NET (Famine Early Warning Systems Network). Data collected monthly from 10 markets across Haiti since 2005."}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDownloadCSV}
            disabled={isDownloading}
            className="bg-sage hover:bg-sage/90 text-parchment-light rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {isDownloading
              ? (language === "kr" ? "Chaje..." : "Downloading...")
              : (language === "kr" ? "Telechaje CSV Konplè (68,000+ dosye)" : "Download Full CSV (68,000+ records)")}
          </button>
          <a
            href="https://fews.net/latin-america-and-caribbean/haiti"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-indigo/10 hover:bg-indigo/20 text-indigo rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            {language === "kr" ? "Vizite FEWS NET" : "Visit FEWS NET"}
          </a>
        </div>
      </section>

      {/* Editorial Content */}
      <div className="prose-custom">
        {/* Section 1: Research Question */}
        <ResearchQuestion />

        {/* Section 2: Primary Artifact */}
        <PrimaryArtifact />

        {/* Section 3: Comparative Cases */}
        <ComparativeCases />

        {/* Section 4: Haitian Context */}
        <HaitianContext />

        {/* Section 5: Bibliography */}
        <Bibliography />
      </div>

      {/* Footer attribution */}
      <footer className="mt-16 pt-8 border-t border-parchment-dark/30 text-center">
        <p className="font-body text-sm text-indigo/50">
          Machann Enfòmasyon Research Framework
        </p>
        <p className="font-mono text-xs text-indigo/40 mt-2">
          v1.0 | 2026
        </p>
      </footer>
    </article>
  );
}
