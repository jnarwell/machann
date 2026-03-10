"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCommodityName } from "@/lib/utils/commodityNames";
import TradeForm from "./TradeForm";

interface Trade {
  id: string;
  date: string;
  commodityId: string;
  qty: number;
  unit: string;
  supplier?: { id: string; name: string } | null;
  marketBought: string;
  pricePaid: number;
  marketSold: string;
  priceReceived: number;
  margin: number;
  notes?: string;
  transportCostHtg?: number;
  transportMode?: string;
  roadCondition?: string;
  weatherCondition?: string;
}

interface TradeResponse {
  trades: Trade[];
  total: number;
  summary: {
    totalTrades: number;
    totalProfit: number;
    avgMargin: number;
  };
}

export default function TradeLog() {
  const { t, language } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [summary, setSummary] = useState({ totalTrades: 0, totalProfit: 0, avgMargin: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchTrades = useCallback(async () => {
    try {
      const response = await fetch("/api/trades?limit=10&includeTransport=true");
      if (response.ok) {
        const data: TradeResponse = await response.json();
        setTrades(data.trades);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error("Failed to fetch trades:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  const handleTradeSuccess = () => {
    fetchTrades();
    setShowForm(false);
    setEditingTrade(null);
  };

  const handleEdit = (trade: Trade) => {
    setEditingTrade(trade);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/trades?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchTrades();
        setDeletingId(null);
      } else {
        const data = await response.json();
        setDeleteError(data.error || "Failed to delete");
        setTimeout(() => setDeleteError(null), 3000);
      }
    } catch (error) {
      console.error("Failed to delete trade:", error);
      setDeleteError("Network error");
      setTimeout(() => setDeleteError(null), 3000);
    }
  };

  const handleCancelEdit = () => {
    setEditingTrade(null);
    setShowForm(false);
  };

  // Use shared commodity name utility
  const getLocalizedCommodityName = (commodityId: string) => {
    return getCommodityName(commodityId, language as "kr" | "en");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "kr" ? "fr-HT" : "en-US", {
      day: "numeric",
      month: "short",
    });
  };

  const getMarginColor = (margin: number) => {
    if (margin >= 25) return "text-alert-green font-semibold";
    if (margin >= 15) return "text-amber-600";
    return "text-indigo/60";
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold text-indigo">
          {t("kominote.tradeLog")}
        </h3>
        <button
          onClick={() => {
            setEditingTrade(null);
            setShowForm(!showForm);
          }}
          className="px-3 py-1.5 bg-terracotta text-parchment rounded-lg text-sm font-display hover:bg-terracotta-600 transition-colors"
        >
          {showForm && !editingTrade ? "\u2715" : "+"} {t("kominote.addTrade")}
        </button>
      </div>

      {/* Delete Error Toast */}
      {deleteError && (
        <div className="mb-3 p-2 bg-alert-red/10 border border-alert-red/30 rounded text-alert-red text-sm">
          {deleteError}
        </div>
      )}

      {showForm && (
        <div className="mb-4">
          <TradeForm
            onClose={handleCancelEdit}
            onSuccess={handleTradeSuccess}
            editTrade={editingTrade || undefined}
          />
        </div>
      )}

      {/* Summary Stats */}
      {!isLoading && trades.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-parchment-dark/20 rounded-lg p-3 text-center">
            <p className="text-xs text-indigo/60">{language === "kr" ? "Total Tranzaksyon" : "Total Trades"}</p>
            <p className="font-mono font-bold text-indigo">{summary.totalTrades}</p>
          </div>
          <div className="bg-parchment-dark/20 rounded-lg p-3 text-center">
            <p className="text-xs text-indigo/60">{language === "kr" ? "Benefis Total" : "Total Profit"}</p>
            <p className="font-mono font-bold text-alert-green">HTG {summary.totalProfit.toLocaleString()}</p>
          </div>
          <div className="bg-parchment-dark/20 rounded-lg p-3 text-center">
            <p className="text-xs text-indigo/60">{language === "kr" ? "Maj Mwayèn" : "Avg Margin"}</p>
            <p className="font-mono font-bold text-amber">{summary.avgMargin}%</p>
          </div>
        </div>
      )}

      {/* Responsive table wrapper with visible scrollbar */}
      <div className="overflow-x-auto -mx-4 px-4 scrollbar-thin">
        <table className="w-full min-w-[650px] text-sm">
          <thead>
            <tr className="border-b border-parchment-dark/50">
              <th className="text-left py-2 px-2 font-display text-indigo/70 font-medium">
                {t("kominote.date")}
              </th>
              <th className="text-left py-2 px-2 font-display text-indigo/70 font-medium">
                {t("kominote.commodity")}
              </th>
              <th className="text-left py-2 px-2 font-display text-indigo/70 font-medium">
                {t("kominote.qty")}
              </th>
              <th className="text-left py-2 px-2 font-display text-indigo/70 font-medium">
                {t("kominote.supplier")}
              </th>
              <th className="text-left py-2 px-2 font-display text-indigo/70 font-medium">
                {t("kominote.marketBought")}
              </th>
              <th className="text-right py-2 px-2 font-display text-indigo/70 font-medium">
                {t("kominote.pricePaid")}
              </th>
              <th className="text-left py-2 px-2 font-display text-indigo/70 font-medium">
                {t("kominote.marketSold")}
              </th>
              <th className="text-right py-2 px-2 font-display text-indigo/70 font-medium">
                {t("kominote.priceReceived")}
              </th>
              <th className="text-right py-2 px-2 font-display text-indigo/70 font-medium">
                {t("kominote.margin")}
              </th>
              <th className="text-center py-2 px-2 font-display text-indigo/70 font-medium">
                {language === "kr" ? "Aksyon" : "Actions"}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-indigo/50">
                  {language === "kr" ? "Chaje..." : "Loading..."}
                </td>
              </tr>
            ) : trades.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-indigo/50">
                  {language === "kr" ? "Pa gen tranzaksyon anko" : "No trades yet"}
                </td>
              </tr>
            ) : (
              trades.map((trade) => (
                <tr
                  key={trade.id}
                  className={`border-b border-parchment-dark/20 hover:bg-parchment-dark/20 transition-colors ${
                    editingTrade?.id === trade.id ? "bg-amber/10" : ""
                  }`}
                >
                  <td className="py-2.5 px-2 text-indigo/80 font-mono text-xs">
                    {formatDate(trade.date)}
                  </td>
                  <td className="py-2.5 px-2 text-indigo font-medium">
                    {getLocalizedCommodityName(trade.commodityId)}
                  </td>
                  <td className="py-2.5 px-2 text-indigo/80 font-mono">
                    {trade.qty} {trade.unit}
                  </td>
                  <td className="py-2.5 px-2 text-indigo/80">
                    {trade.supplier?.name || "-"}
                  </td>
                  <td className="py-2.5 px-2 text-indigo/80">
                    {trade.marketBought}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-indigo/80">
                    {trade.pricePaid}
                  </td>
                  <td className="py-2.5 px-2 text-indigo/80">
                    {trade.marketSold}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-indigo/80">
                    {trade.priceReceived}
                  </td>
                  <td
                    className={`py-2.5 px-2 text-right font-mono ${getMarginColor(
                      trade.margin
                    )}`}
                  >
                    +{trade.margin.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleEdit(trade)}
                        className="p-1.5 text-indigo/50 hover:text-indigo hover:bg-parchment-dark/30 rounded transition-colors"
                        title={language === "kr" ? "Modifye" : "Edit"}
                      >
                        {"\u270E"}
                      </button>
                      <button
                        onClick={() => handleDelete(trade.id)}
                        disabled={deletingId === trade.id}
                        className="p-1.5 text-indigo/50 hover:text-alert-red hover:bg-alert-red/10 rounded transition-colors disabled:opacity-50"
                        title={language === "kr" ? "Efase" : "Delete"}
                      >
                        {deletingId === trade.id ? "\u21BB" : "\u2717"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
