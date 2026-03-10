"use client";

import React, { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CommodityPrice } from "@/lib/api/types";
import { Commodity } from "@/data/commodities";
import Sparkline from "./Sparkline";

type CommodityData = Commodity | CommodityPrice;

interface CommodityDetailModalProps {
  commodity: CommodityData;
  isOpen: boolean;
  onClose: () => void;
  onReportPrice?: () => void;
}

const REGION_LABELS: Record<string, { kr: string; en: string }> = {
  portauprince: { kr: "Pòtoprens", en: "Port-au-Prince" },
  artibonite: { kr: "Latibonit", en: "Artibonite" },
  north: { kr: "Nò", en: "North" },
  south: { kr: "Sid", en: "South" },
  center: { kr: "Sant", en: "Center" },
  northwest: { kr: "Nòdwès", en: "Northwest" },
};

export default function CommodityDetailModal({
  commodity,
  isOpen,
  onClose,
  onReportPrice,
}: CommodityDetailModalProps) {
  const { language } = useLanguage();

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const name = language === "kr" ? commodity.nameKR : commodity.nameEN;
  const altName = language === "kr" ? commodity.nameEN : commodity.nameKR;

  // Handle both mock data and live data unit formats
  const unit =
    "unitKeyKR" in commodity
      ? language === "kr"
        ? commodity.unitKeyKR
        : commodity.unitKeyEN
      : `/ ${commodity.unit}`;

  // Get trend info
  const change7d = "change7d" in commodity ? commodity.change7d : 0;
  const change30d = commodity.change30d ?? 0;

  const getTrendInfo = () => {
    if (commodity.trend === "up") {
      return {
        arrow: "\u2191",
        colorClass: "text-alert-red",
        bgClass: "bg-alert-red/10",
      };
    } else if (commodity.trend === "down") {
      return {
        arrow: "\u2193",
        colorClass: "text-alert-green",
        bgClass: "bg-alert-green/10",
      };
    }
    return {
      arrow: "\u2192",
      colorClass: "text-amber-600",
      bgClass: "bg-amber/10",
    };
  };

  const trendInfo = getTrendInfo();

  // Normalize priceHistory to number[] for Sparkline
  const priceHistoryData = Array.isArray(commodity.priceHistory)
    ? commodity.priceHistory.map((p) => (typeof p === "number" ? p : p.price))
    : [];

  // Get regional prices
  const regionalPrices = commodity.regionalPrices || {};

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-indigo/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-16 bottom-4 left-4 right-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-full md:max-h-[85vh] bg-parchment rounded-xl shadow-xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-indigo text-parchment px-4 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            {commodity.icon && (
              <span className="text-2xl">{commodity.icon}</span>
            )}
            <div>
              <h2 className="font-display text-lg font-semibold">{name}</h2>
              <p className="text-parchment/70 text-xs">{altName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-parchment/70 hover:text-parchment text-xl p-1"
          >
            {"\u2715"}
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Current Price */}
          <section className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo/60 mb-1">
                  {language === "kr" ? "Pri kouran" : "Current Price"}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-bold text-indigo">
                    {commodity.currentPrice.toLocaleString()}
                  </span>
                  <span className="text-indigo/60">HTG</span>
                </div>
                <p className="text-xs text-indigo/50 mt-1">{unit}</p>
              </div>

              {/* Trend badge */}
              <div
                className={`flex items-center gap-1 px-3 py-2 rounded-lg ${trendInfo.bgClass}`}
              >
                <span className={`text-xl font-bold ${trendInfo.colorClass}`}>
                  {trendInfo.arrow}
                </span>
              </div>
            </div>
          </section>

          {/* Price Changes */}
          <section className="grid grid-cols-2 gap-3">
            <div className="card p-3 text-center">
              <p className="text-xs text-indigo/60 mb-1">
                {language === "kr" ? "7 jou" : "7 days"}
              </p>
              <p
                className={`font-mono font-bold text-lg ${
                  change7d > 0
                    ? "text-alert-red"
                    : change7d < 0
                    ? "text-alert-green"
                    : "text-indigo"
                }`}
              >
                {change7d > 0 ? "+" : ""}
                {change7d}%
              </p>
            </div>
            <div className="card p-3 text-center">
              <p className="text-xs text-indigo/60 mb-1">
                {language === "kr" ? "30 jou" : "30 days"}
              </p>
              <p
                className={`font-mono font-bold text-lg ${
                  change30d > 0
                    ? "text-alert-red"
                    : change30d < 0
                    ? "text-alert-green"
                    : "text-indigo"
                }`}
              >
                {change30d > 0 ? "+" : ""}
                {change30d}%
              </p>
            </div>
          </section>

          {/* Price Trend Chart */}
          <section className="card p-4">
            <h3 className="font-display text-sm font-semibold text-indigo mb-3">
              {language === "kr" ? "Tandans Pri" : "Price Trend"}
            </h3>
            <div className="flex justify-center">
              <Sparkline
                data={priceHistoryData}
                trend={commodity.trend}
                width={280}
                height={80}
              />
            </div>
            <p className="text-center text-xs text-indigo/50 mt-2">
              {language === "kr"
                ? "Dènye 30 jou pri istwa"
                : "Last 30 days price history"}
            </p>
          </section>

          {/* Regional Prices */}
          <section className="card p-4">
            <h3 className="font-display text-sm font-semibold text-indigo mb-3">
              {language === "kr" ? "Pri pa rejyon" : "Prices by Region"}
            </h3>
            <div className="space-y-2">
              {Object.entries(REGION_LABELS).map(([key, labels]) => {
                const price =
                  regionalPrices[key as keyof typeof regionalPrices];
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between py-2 border-b border-indigo/10 last:border-b-0"
                  >
                    <span className="text-sm text-indigo/80">
                      {language === "kr" ? labels.kr : labels.en}
                    </span>
                    <span className="font-mono text-sm font-medium text-indigo">
                      {price !== null && price !== undefined
                        ? `${price.toLocaleString()} HTG`
                        : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Report Price Button */}
          {onReportPrice && (
            <button
              onClick={onReportPrice}
              className="w-full px-4 py-3 bg-sage text-parchment rounded-lg font-display font-medium hover:bg-sage-600 transition-colors flex items-center justify-center gap-2"
            >
              <span>{"\u270E"}</span>
              {language === "kr"
                ? "Rapòte pri pou pwodui sa a"
                : "Report price for this commodity"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
