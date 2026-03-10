"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Commodity } from "@/data/commodities";
import { CommodityPrice } from "@/lib/api/types";
import Sparkline from "./Sparkline";

// Accept either mock Commodity or live CommodityPrice
type CommodityData = Commodity | CommodityPrice;

interface CommodityCardProps {
  commodity: CommodityData;
  selectedRegion?: string;
  onClick?: () => void;
}

export default function CommodityCard({ commodity, onClick }: CommodityCardProps) {
  const { language, t } = useLanguage();

  const name = language === "kr" ? commodity.nameKR : commodity.nameEN;

  // Handle both mock data (unitKeyKR/unitKeyEN) and live data (unit)
  const unit = "unitKeyKR" in commodity
    ? (language === "kr" ? commodity.unitKeyKR : commodity.unitKeyEN)
    : `/ ${commodity.unit}`;

  // Determine trend styling
  const getTrendInfo = () => {
    // Use change7d as primary (required field in CommodityPrice), fall back to change30d
    const change7d = "change7d" in commodity ? commodity.change7d : 0;
    const change30d = commodity.change30d ?? 0;
    const displayChange = change7d !== 0 ? change7d : change30d;

    if (commodity.trend === "up") {
      return {
        arrow: "\u2191", // up arrow
        text: displayChange > 0 ? `+${displayChange}%` : `${displayChange}%`,
        colorClass: "price-up",
        borderColor: "border-t-alert-red",
        label: t("priMache.priceUp"),
      };
    } else if (commodity.trend === "down") {
      return {
        arrow: "\u2193", // down arrow
        text: `${displayChange}%`,
        colorClass: "price-down",
        borderColor: "border-t-alert-green",
        label: t("priMache.priceDown"),
      };
    } else {
      return {
        arrow: "\u2192", // right arrow
        text: t("priMache.priceStable"),
        colorClass: "price-stable",
        borderColor: "border-t-amber",
        label: t("priMache.priceStable"),
      };
    }
  };

  const trendInfo = getTrendInfo();

  // Check if this commodity has a price spike alert (>15% in 30 days)
  const hasAlert = (commodity.change30d ?? 0) > 15;

  // Normalize priceHistory to number[] for Sparkline
  const priceHistoryData = Array.isArray(commodity.priceHistory)
    ? commodity.priceHistory.map((p) =>
        typeof p === "number" ? p : p.price
      )
    : [];

  return (
    <button
      onClick={onClick}
      className={`card p-4 relative border-t-4 ${trendInfo.borderColor} transition-shadow hover:shadow-lg text-left w-full cursor-pointer`}
    >
      {/* Alert indicator */}
      {hasAlert && (
        <div className="absolute top-2 right-2">
          <span className="text-alert-red text-sm" title="Price Alert">
            !
          </span>
        </div>
      )}

      {/* Name */}
      <div className="mb-3">
        <h3 className="font-display font-semibold text-indigo truncate">
          {name}
        </h3>
        <p className="text-xs text-indigo/60 truncate">
          {language === "kr" ? commodity.nameEN : commodity.nameKR}
        </p>
      </div>

      {/* Price */}
      <div className="mb-3">
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-2xl font-bold text-indigo">
            {commodity.currentPrice.toLocaleString()}
          </span>
          <span className="text-sm text-indigo/60">HTG</span>
        </div>
        <p className="text-xs text-indigo/50">{unit}</p>
      </div>

      {/* Trend indicator and sparkline */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1 ${trendInfo.colorClass}`}>
          <span className="text-lg font-bold">{trendInfo.arrow}</span>
          <span className="text-sm font-medium">{trendInfo.text}</span>
        </div>

        <Sparkline
          data={priceHistoryData}
          trend={commodity.trend}
          width={70}
          height={22}
        />
      </div>
    </button>
  );
}
