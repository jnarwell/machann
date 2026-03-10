"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import BRHSection from "./BRHSection";
import IMFSection from "./IMFSection";
import ImportTracker from "./ImportTracker";
import MarketNews from "./MarketNews";

export default function AkteEkonomikTab() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-parchment-light">
      {/* Tab Header */}
      <header className="bg-indigo-500 text-white px-4 py-6 md:px-6 md:py-8">
        <h1 className="font-display text-2xl md:text-3xl">
          {t("akteEkonomik.title")}
        </h1>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 md:px-6 md:py-8 max-w-4xl mx-auto space-y-6">
        {/* BRH Exchange Rate Section */}
        <BRHSection />

        {/* IMF / Policy Section */}
        <IMFSection />

        {/* Import Competition Tracker */}
        <ImportTracker />

        {/* Market News Feed */}
        <MarketNews />
      </main>
    </div>
  );
}
