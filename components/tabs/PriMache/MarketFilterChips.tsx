"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { regions } from "@/data/commodities";

interface MarketFilterChipsProps {
  selectedRegion: string;
  onSelectRegion: (regionId: string) => void;
}

export default function MarketFilterChips({
  selectedRegion,
  onSelectRegion,
}: MarketFilterChipsProps) {
  const { language } = useLanguage();

  return (
    <div className="w-full overflow-x-auto scrollbar-thin">
      <div className="flex gap-2 pb-2 min-w-max">
        {regions.map((region) => {
          const isSelected = selectedRegion === region.id;
          const name = language === "kr" ? region.nameKR : region.nameEN;

          return (
            <button
              key={region.id}
              onClick={() => onSelectRegion(region.id)}
              className={`
                px-4 py-2 rounded-full text-sm font-body whitespace-nowrap
                transition-all duration-200
                ${
                  isSelected
                    ? "bg-terracotta text-parchment-light shadow-md"
                    : "bg-parchment-dark/50 text-indigo hover:bg-parchment-dark"
                }
              `}
              aria-pressed={isSelected}
            >
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
