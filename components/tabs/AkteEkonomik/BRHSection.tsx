"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useExchange } from "@/hooks";
import { brhData } from "@/data/macro";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function BRHSection() {
  const { language, t } = useLanguage();
  const { rates } = useExchange();

  // Use live rates if available, fallback to mock data
  const officialRate = rates?.official || brhData.official;
  const streetRate = rates?.street || brhData.street;
  const spread = streetRate - officialRate;
  const policyNote =
    language === "kr" ? brhData.policyNoteKR : brhData.policyNoteEN;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "kr" ? "fr-HT" : "en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <section className="bg-parchment rounded-lg p-4 md:p-6 shadow-sm border border-parchment-dark">
      {/* Header */}
      <h2 className="font-display text-xl md:text-2xl text-indigo-500 mb-4">
        {t("akteEkonomik.brh.title")}
      </h2>

      {/* Exchange Rates Grid */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
        {/* Official Rate */}
        <div className="bg-white rounded-lg p-3 md:p-4 border border-sage-200">
          <p className="text-xs md:text-sm text-indigo-400 font-body mb-1">
            {t("akteEkonomik.brh.official")}
          </p>
          <p className="text-xl md:text-2xl font-display text-indigo-500">
            {officialRate.toFixed(1)}
          </p>
          <p className="text-xs text-sage-500 font-body">HTG/USD</p>
        </div>

        {/* Street Rate */}
        <div className="bg-white rounded-lg p-3 md:p-4 border border-amber-200">
          <p className="text-xs md:text-sm text-amber-600 font-body mb-1">
            {t("akteEkonomik.brh.street")}
          </p>
          <p className="text-xl md:text-2xl font-display text-amber-500">
            {streetRate.toFixed(1)}
          </p>
          <p className="text-xs text-sage-500 font-body">HTG/USD</p>
        </div>

        {/* Spread */}
        <div className="bg-terracotta-50 rounded-lg p-3 md:p-4 border border-terracotta-200">
          <p className="text-xs md:text-sm text-terracotta-600 font-body mb-1">
            {t("akteEkonomik.brh.spread")}
          </p>
          <p className="text-xl md:text-2xl font-display text-terracotta-500">
            +{spread.toFixed(1)}
          </p>
          <p className="text-xs text-terracotta-400 font-body">HTG</p>
        </div>
      </div>

      {/* 90-Day Chart */}
      <div className="bg-white rounded-lg p-3 md:p-4 border border-parchment-dark mb-4">
        <h3 className="text-sm font-body text-indigo-400 mb-3">
          {language === "kr" ? "Istwa to 90 jou" : "90-Day Rate History"}
        </h3>
        <div className="h-48 md:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={brhData.history}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E8DFC8" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 10, fill: "#475F97" }}
                stroke="#A3AFCB"
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={["dataMin - 2", "dataMax + 2"]}
                tick={{ fontSize: 10, fill: "#475F97" }}
                stroke="#A3AFCB"
                tickLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FDF6E8",
                  border: "1px solid #E8DFC8",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelFormatter={(label) => formatDate(label as string)}
                formatter={(value) => [
                  `${Number(value).toFixed(1)} HTG`,
                  language === "kr" ? "To" : "Rate",
                ]}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#C1440E"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#C1440E" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Policy Note */}
      <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
        <h3 className="text-sm font-display text-indigo-500 mb-2">
          {t("akteEkonomik.brh.policy")}
        </h3>
        <p className="text-sm font-body text-indigo-400 leading-relaxed">
          {policyNote}
        </p>
        <p className="text-xs text-indigo-300 mt-2 font-mono">
          {language === "kr" ? "Dènye mizajou" : "Last updated"}:{" "}
          {formatDate(brhData.lastUpdated)}
        </p>
      </div>
    </section>
  );
}
