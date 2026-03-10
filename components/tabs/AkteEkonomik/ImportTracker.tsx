"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { importData, borderStatus } from "@/data/macro";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function ImportTracker() {
  const { language, t } = useLanguage();

  // Commodity name translations
  const commodityNames: Record<string, { kr: string; en: string }> = {
    rice: { kr: "Diri", en: "Rice" },
    maize: { kr: "Mayi", en: "Maize" },
    beans: { kr: "Pwa", en: "Beans" },
  };

  // Prepare chart data
  const chartData = importData.map((item) => ({
    name: commodityNames[item.commodity]?.[language] || item.commodity,
    local: Math.round(item.localShare * 100),
    imported: Math.round(item.importedShare * 100),
    subsidized: item.subsidized,
  }));

  const borderStatusText =
    language === "kr" ? borderStatus.statusKR : borderStatus.statusEN;
  const borderNote =
    language === "kr" ? borderStatus.noteKR : borderStatus.noteEN;

  return (
    <section className="bg-parchment rounded-lg p-4 md:p-6 shadow-sm border border-parchment-dark">
      {/* Header */}
      <h2 className="font-display text-xl md:text-2xl text-indigo-500 mb-4">
        {t("akteEkonomik.imports.title")}
      </h2>

      {/* Status Badges */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* US Rice Subsidy */}
        <div className="bg-alert-red/10 rounded-lg p-3 border border-alert-red/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-body text-indigo-400">
              {language === "kr" ? "Sibvansyon Diri US" : "US Rice Subsidy"}
            </span>
            <span className="px-2 py-0.5 bg-alert-red text-white text-xs font-mono rounded">
              {t("akteEkonomik.imports.active")}
            </span>
          </div>
          <p className="text-xs font-body text-indigo-500 leading-relaxed">
            {language === "kr"
              ? "Diri ameriken rive Ayiti a 30% mwen che pase diri lokal akoz sibvansyon USDA"
              : "US rice arrives 30% cheaper than local rice due to USDA subsidies"}
          </p>
        </div>

        {/* Dominican Border */}
        <div className="bg-sage-50 rounded-lg p-3 border border-sage-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-body text-indigo-400">
              {t("akteEkonomik.imports.border")}
            </span>
            <span className="px-2 py-0.5 bg-sage-500 text-white text-xs font-mono rounded">
              {borderStatusText}
            </span>
          </div>
          <p className="text-xs font-body text-indigo-500 leading-relaxed">
            {borderNote}
          </p>
        </div>
      </div>

      {/* Import Share Chart */}
      <div className="bg-white rounded-lg p-4 border border-parchment-dark mb-4">
        <h3 className="text-sm font-body text-indigo-400 mb-3">
          {language === "kr"
            ? "Pa Mache: Lokal vs Enpote"
            : "Market Share: Local vs Imported"}
        </h3>
        <div className="h-48 md:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
            >
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "#475F97" }}
                stroke="#A3AFCB"
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12, fill: "#1E2A4A" }}
                stroke="#A3AFCB"
                width={50}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FDF6E8",
                  border: "1px solid #E8DFC8",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value, name) => [
                  `${Number(value)}%`,
                  String(name) === "local"
                    ? language === "kr"
                      ? "Lokal"
                      : "Local"
                    : language === "kr"
                    ? "Enpote"
                    : "Imported",
                ]}
              />
              <Legend
                formatter={(value) =>
                  value === "local"
                    ? language === "kr"
                      ? "Pa lokal"
                      : "Local share"
                    : language === "kr"
                    ? "Pa enpote"
                    : "Imported share"
                }
                wrapperStyle={{ fontSize: "12px" }}
              />
              <Bar
                dataKey="local"
                stackId="a"
                fill="#6B7C5E"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="imported"
                stackId="a"
                fill="#C1440E"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Impact Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-display text-indigo-500">
          {t("akteEkonomik.imports.howAffects")}
        </h3>
        {importData.map((item) => {
          const impact = language === "kr" ? item.impactKR : item.impactEN;
          const commodityName =
            commodityNames[item.commodity]?.[language] || item.commodity;

          return (
            <div
              key={item.commodity}
              className={`rounded-lg p-3 border ${
                item.subsidized
                  ? "bg-amber-50 border-amber-200"
                  : "bg-sage-50 border-sage-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-body text-sm text-indigo-500 font-medium">
                  {commodityName}
                </span>
                {item.subsidized && (
                  <span className="px-1.5 py-0.5 bg-amber-200 text-amber-700 text-xs font-mono rounded">
                    {t("akteEkonomik.imports.subsidy")}
                  </span>
                )}
                <span className="text-xs text-indigo-400 font-mono ml-auto">
                  {Math.round(item.localShare * 100)}% /{" "}
                  {Math.round(item.importedShare * 100)}%
                </span>
              </div>
              <p className="text-xs font-body text-indigo-400 leading-relaxed">
                {impact}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
