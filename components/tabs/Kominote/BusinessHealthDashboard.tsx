"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCommodityName } from "@/lib/utils/commodityNames";

interface HealthMetrics {
  periodStart: string;
  periodEnd: string;
  periodType: string;
  totalRevenue: number;
  totalCost: number;
  totalTransportCost: number;
  netProfit: number;
  avgMargin: number;
  tradeCount: number;
  totalVolume: number;
  topCommodities: { id: string; name: string; profit: number; count: number }[];
  topRoutes: { from: string; to: string; avgMargin: number; count: number }[];
  topSuppliers: { id: string; name: string; profit: number; count: number }[];
  trendData: { date: string; revenue: number; profit: number; tradeCount: number }[];
  profitTrend: string;
  volumeTrend: string;
  marginTrend: string;
}

type PeriodType = "weekly" | "monthly" | "quarterly";

export default function BusinessHealthDashboard() {
  const { language } = useLanguage();
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodType>("monthly");

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/health?periodType=${period}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error("Failed to fetch health metrics:", error);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const getLocalizedCommodityName = (commodityId: string) => {
    return getCommodityName(commodityId, language as "kr" | "en");
  };

  const getTrendIcon = (trend: string | undefined) => {
    if (trend === "up") return "\u2191";
    if (trend === "down") return "\u2193";
    return "\u2194";
  };

  const getTrendColor = (trend: string | undefined) => {
    if (trend === "up") return "text-alert-green";
    if (trend === "down") return "text-alert-red";
    return "text-indigo/50";
  };

  const periodLabels = {
    weekly: { kr: "7 jou", en: "7 days" },
    monthly: { kr: "30 jou", en: "30 days" },
    quarterly: { kr: "90 jou", en: "90 days" },
  };

  // Simple sparkline component
  const MiniSparkline = ({ data, color }: { data: number[]; color: string }) => {
    if (data.length < 2) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 80;
    const height = 24;
    const points = data
      .map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((v - min) / range) * height;
        return `${x},${y}`;
      })
      .join(" ");

    const colorMap: Record<string, string> = {
      indigo: "#7587B1",
      green: "#4A7C59",
      amber: "#D4872A",
    };

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={colorMap[color] || colorMap.indigo}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  if (isLoading) {
    return (
      <div className="card p-4 md:p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-parchment-dark/30 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-parchment-dark/20 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!metrics || metrics.tradeCount === 0) {
    return (
      <div className="card p-4 md:p-6">
        <h3 className="font-display text-lg font-semibold text-indigo mb-4">
          {language === "kr" ? "Sante Biznis" : "Business Health"}
        </h3>
        <p className="text-center text-indigo/50 py-8">
          {language === "kr"
            ? "Pa gen ase tranzaksyon pou montre estatistik"
            : "Not enough trades to show statistics"}
        </p>
      </div>
    );
  }

  return (
    <div className="card p-4 md:p-6">
      {/* Header with period selector */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg font-semibold text-indigo">
          {language === "kr" ? "Sante Biznis" : "Business Health"}
        </h3>
        <div className="flex gap-1 bg-parchment-dark/30 rounded-full p-1">
          {(["weekly", "monthly", "quarterly"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                period === p
                  ? "bg-terracotta text-parchment"
                  : "text-indigo/60 hover:text-indigo"
              }`}
            >
              {language === "kr" ? periodLabels[p].kr : periodLabels[p].en}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Revenue Card */}
        <div className="bg-indigo/5 rounded-lg p-4">
          <p className="text-xs text-indigo/60 mb-1">
            {language === "kr" ? "Revni" : "Revenue"}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xl md:text-2xl font-bold text-indigo">
              {metrics.totalRevenue.toLocaleString()}
            </span>
            <span className="text-xs text-indigo/50">HTG</span>
          </div>
          <div className="mt-2 h-6">
            <MiniSparkline
              data={metrics.trendData.map((d) => d.revenue)}
              color="indigo"
            />
          </div>
        </div>

        {/* Profit Card */}
        <div className="bg-alert-green/10 rounded-lg p-4">
          <p className="text-xs text-indigo/60 mb-1">
            {language === "kr" ? "Benefis Nèt" : "Net Profit"}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xl md:text-2xl font-bold text-alert-green">
              {metrics.netProfit.toLocaleString()}
            </span>
            <span className="text-xs text-indigo/50">HTG</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <MiniSparkline
              data={metrics.trendData.map((d) => d.profit)}
              color="green"
            />
            <span className={`text-sm ${getTrendColor(metrics.profitTrend)}`}>
              {getTrendIcon(metrics.profitTrend)}
            </span>
          </div>
        </div>

        {/* Avg Margin Card */}
        <div className="bg-amber/10 rounded-lg p-4">
          <p className="text-xs text-indigo/60 mb-1">
            {language === "kr" ? "Maj Mwayèn" : "Avg Margin"}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-xl md:text-2xl font-bold text-amber">
              {metrics.avgMargin.toFixed(1)}
            </span>
            <span className="text-lg text-amber">%</span>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <div className="flex-1 h-2 bg-parchment-dark/30 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  metrics.avgMargin >= 20 ? "bg-alert-green" : metrics.avgMargin >= 10 ? "bg-amber" : "bg-alert-red"
                }`}
                style={{ width: `${Math.min(100, metrics.avgMargin * 2)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Trade Count Card */}
        <div className="bg-sage/10 rounded-lg p-4">
          <p className="text-xs text-indigo/60 mb-1">
            {language === "kr" ? "Total Tranzaksyon" : "Total Trades"}
          </p>
          <span className="font-mono text-xl md:text-2xl font-bold text-sage">
            {metrics.tradeCount}
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-indigo/50">
              {metrics.totalVolume.toFixed(0)} {language === "kr" ? "inite" : "units"}
            </span>
            <span className={`text-sm ${getTrendColor(metrics.volumeTrend)}`}>
              {getTrendIcon(metrics.volumeTrend)}
            </span>
          </div>
        </div>
      </div>

      {/* Transport Cost Summary (if applicable) */}
      {metrics.totalTransportCost > 0 && (
        <div className="mb-6 p-3 bg-parchment-dark/20 rounded-lg flex items-center justify-between">
          <span className="text-sm text-indigo/70">
            {language === "kr" ? "Total kou transpò:" : "Total transport cost:"}
          </span>
          <span className="font-mono text-sm font-semibold text-terracotta">
            -{metrics.totalTransportCost.toLocaleString()} HTG
          </span>
        </div>
      )}

      {/* Two Column: Top Commodities + Route Profitability */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Commodities */}
        <div>
          <h4 className="font-display text-sm font-semibold text-indigo mb-3">
            {language === "kr" ? "Pwodui Pi Rentab" : "Most Profitable"}
          </h4>
          <div className="space-y-2">
            {metrics.topCommodities.slice(0, 5).map((c, i) => (
              <div key={c.id} className="flex items-center gap-3">
                <span className="text-xs text-indigo/50 w-4">{i + 1}</span>
                <span className="text-sm text-indigo flex-1 truncate">
                  {getLocalizedCommodityName(c.id)}
                </span>
                <div className="w-16 md:w-24 h-2 bg-parchment-dark/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sage rounded-full"
                    style={{
                      width: `${
                        metrics.topCommodities[0]?.profit
                          ? (c.profit / metrics.topCommodities[0].profit) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="font-mono text-xs text-alert-green whitespace-nowrap">
                  +{c.profit.toLocaleString()}
                </span>
              </div>
            ))}
            {metrics.topCommodities.length === 0 && (
              <p className="text-sm text-indigo/50 text-center py-2">
                {language === "kr" ? "Pa gen done" : "No data"}
              </p>
            )}
          </div>
        </div>

        {/* Route Profitability Table */}
        <div>
          <h4 className="font-display text-sm font-semibold text-indigo mb-3">
            {language === "kr" ? "Wout Pi Rentab" : "Top Routes"}
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-parchment-dark/30">
                  <th className="text-left py-2 text-xs text-indigo/60">
                    {language === "kr" ? "Wout" : "Route"}
                  </th>
                  <th className="text-right py-2 text-xs text-indigo/60">
                    {language === "kr" ? "Maj" : "Margin"}
                  </th>
                  <th className="text-right py-2 text-xs text-indigo/60">#</th>
                </tr>
              </thead>
              <tbody>
                {metrics.topRoutes.slice(0, 5).map((route, i) => (
                  <tr key={i} className="border-b border-parchment-dark/20">
                    <td className="py-2 text-indigo text-xs md:text-sm">
                      {route.from} {"\u2192"} {route.to}
                    </td>
                    <td
                      className={`py-2 text-right font-mono ${
                        route.avgMargin >= 20 ? "text-alert-green" : "text-amber"
                      }`}
                    >
                      {route.avgMargin.toFixed(1)}%
                    </td>
                    <td className="py-2 text-right text-indigo/50">{route.count}</td>
                  </tr>
                ))}
                {metrics.topRoutes.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-indigo/50">
                      {language === "kr" ? "Pa gen done" : "No data"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
