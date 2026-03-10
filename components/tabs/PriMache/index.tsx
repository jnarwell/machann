"use client";

import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePrices, useExchange } from "@/hooks";
import CommodityGrid from "./CommodityGrid";
import MarketFilterChips from "./MarketFilterChips";
import AlertBanner from "./AlertBanner";
import RegionalPriceTable from "./RegionalPriceTable";
import DataSourceToggle, { DataSource } from "@/components/ui/DataSourceToggle";
import PriceReportForm from "./PriceReportForm";

export default function PriMacheTab() {
  const { language, t } = useLanguage();
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [isCalloutOpen, setIsCalloutOpen] = useState(false);
  const [dataSource, setDataSource] = useState<DataSource>("official");
  const [showPriceReportForm, setShowPriceReportForm] = useState(false);
  const [prefillCommodityId, setPrefillCommodityId] = useState<string | undefined>();

  // Handle opening price report from commodity modal
  const handleReportPrice = (commodityId: string) => {
    setPrefillCommodityId(commodityId);
    setShowPriceReportForm(true);
  };

  // Fetch live data with fallback to mock - refetches when dataSource changes
  const { prices, source: priceSource, lastUpdated: priceLastUpdated } = usePrices({
    refreshInterval: parseInt(process.env.NEXT_PUBLIC_PRICE_REFRESH_INTERVAL || "3600000"),
    dataSource,
  });

  const { rates, source: rateSource } = useExchange({
    refreshInterval: parseInt(process.env.NEXT_PUBLIC_EXCHANGE_REFRESH_INTERVAL || "1800000"),
  });

  // Format last updated time
  const formatLastUpdated = (isoString: string | null) => {
    if (!isoString) return language === "kr" ? "Chaje..." : "Loading...";

    const date = new Date(isoString);
    const timeStr = date.toLocaleTimeString(language === "kr" ? "fr-HT" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const dateStr = date.toLocaleDateString(language === "kr" ? "fr-HT" : "en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return `${timeStr} — ${dateStr}`;
  };

  // Show data source indicator - use checkmark for live/cached (real data), warning for demo
  const sourceLabel = priceSource === "live"
    ? language === "kr" ? "\u2713 Viv" : "\u2713 Live"
    : priceSource === "cache"
    ? language === "kr" ? "\u2713 Ajou" : "\u2713 Current"
    : language === "kr" ? "\u26A0 Demo" : "\u26A0 Demo";

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <header className="card-indigo p-6 rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-parchment-light mb-2">
              {t("priMache.title")}
            </h1>
            <p className="text-parchment/80 text-sm">
              {t("priMache.subtitle")}
            </p>
          </div>

          {/* Last updated and exchange rate */}
          <div className="flex flex-col sm:flex-row gap-3 text-sm">
            {/* Last updated chip */}
            <div className="bg-indigo-400/30 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-parchment/70 text-xs">
                  {t("priMache.lastUpdated")}:
                </span>
                <span className="text-xs text-amber-300 font-mono">
                  {sourceLabel}
                </span>
              </div>
              <p className="text-parchment-light font-medium text-sm">
                {formatLastUpdated(priceLastUpdated)}
              </p>
            </div>

            {/* Exchange rate chip */}
            <div className="bg-amber/20 rounded-lg px-3 py-2">
              <span className="text-parchment/70 text-xs">
                {t("priMache.exchangeRate")}
              </span>
              <p className="text-parchment-light font-mono font-bold">
                1 USD = {rates?.official.toFixed(1) || "---"} HTG
              </p>
              <div className="flex items-center gap-1">
                <span className="text-parchment/60 text-xs">
                  {t("priMache.source")}
                </span>
                {rateSource !== "fallback" && (
                  <span className="text-amber-300 text-xs">
                    {language === "kr" ? "(reyèl)" : "(real)"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Data Source Toggle and Report Button */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <DataSourceToggle
          value={dataSource}
          onChange={setDataSource}
          compact
        />
        <button
          onClick={() => setShowPriceReportForm(!showPriceReportForm)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-display text-sm transition-all
            ${showPriceReportForm
              ? "bg-sage text-parchment"
              : "bg-sage/20 text-sage-600 hover:bg-sage/30"
            }
          `}
        >
          <span>{showPriceReportForm ? "\u2715" : "\u270E"}</span>
          {language === "kr"
            ? showPriceReportForm ? "Fèmen" : "Rapòte Pri"
            : showPriceReportForm ? "Close" : "Report Price"
          }
        </button>
      </section>

      {/* Price Report Form (collapsible) */}
      {showPriceReportForm && (
        <section>
          <PriceReportForm
            onClose={() => {
              setShowPriceReportForm(false);
              setPrefillCommodityId(undefined);
            }}
            onSuccess={() => {
              // Could refresh user-generated prices here
            }}
            prefillCommodity={prefillCommodityId}
          />
        </section>
      )}

      {/* Market Filter Chips */}
      <section aria-label={language === "kr" ? "Filtre rejyon" : "Region filter"}>
        <MarketFilterChips
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
        />
      </section>

      {/* Alert Banner - pass live prices */}
      <AlertBanner prices={prices} />

      {/* Commodity Grid - pass live prices */}
      <section aria-label={language === "kr" ? "Pri pwodui yo" : "Commodity prices"}>
        <CommodityGrid
          prices={prices}
          selectedRegion={selectedRegion}
          dataSource={dataSource}
          onReportPrice={handleReportPrice}
        />
      </section>

      {/* Regional Price Comparison Table */}
      <section className="card p-4 md:p-6">
        <h2 className="font-display text-xl font-semibold text-indigo mb-4">
          {t("priMache.regionalComparison")}
        </h2>
        <RegionalPriceTable prices={prices} />
      </section>

      {/* Collapsible Callout */}
      <section className="card overflow-hidden">
        <button
          onClick={() => setIsCalloutOpen(!isCalloutOpen)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-parchment-dark/20 transition-colors"
          aria-expanded={isCalloutOpen}
        >
          <h3 className="font-display font-semibold text-indigo flex items-center gap-2">
            <span className="text-sage font-bold">[i]</span>
            {t("priMache.whyMatters.title")}
          </h3>
          <span
            className={`text-indigo/60 transition-transform duration-200 ${
              isCalloutOpen ? "rotate-180" : ""
            }`}
          >
            {"\u25BC"}
          </span>
        </button>

        <div
          className={`
            overflow-hidden transition-all duration-300
            ${isCalloutOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
          `}
        >
          <div className="px-4 pb-4 pt-0">
            <div className="bg-sage-50 border-l-4 border-sage rounded-r-lg p-4">
              <p className="text-indigo/80 text-sm leading-relaxed font-body italic">
                {t("priMache.whyMatters.content")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
