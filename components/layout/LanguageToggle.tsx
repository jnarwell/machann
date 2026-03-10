"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  // Show current language with indicator for switch action
  // HT = Haitian Creole (ISO 639-1), EN = English
  const currentLang = language === "kr" ? "HT" : "EN";
  const targetLang = language === "kr" ? "EN" : "HT";

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-parchment/20 hover:bg-parchment/30 text-parchment text-sm font-body font-medium transition-colors duration-200 border border-parchment/30"
      aria-label={`Switch to ${language === "kr" ? "English" : "Kreyòl"}`}
    >
      <span className="font-semibold">{currentLang}</span>
      <span className="text-parchment/60">{"\u2192"}</span>
      <span className="text-parchment/70">{targetLang}</span>
    </button>
  );
}
