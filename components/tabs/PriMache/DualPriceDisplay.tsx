"use client";

import { useLanguage } from "@/contexts/LanguageContext";

interface PriceData {
  price: number;
  unit: string;
  source: "official" | "user";
  observationCount?: number;
  confidenceScore?: number;
  lastUpdated?: string;
}

interface DualPriceDisplayProps {
  officialPrice?: PriceData;
  userPrice?: PriceData;
  commodityName: string;
  showConfidence?: boolean;
  layout?: "horizontal" | "vertical" | "compact";
}

export default function DualPriceDisplay({
  officialPrice,
  userPrice,
  commodityName,
  showConfidence = true,
  layout = "horizontal",
}: DualPriceDisplayProps) {
  const { language } = useLanguage();

  const renderConfidenceBadge = (score?: number, count?: number) => {
    if (!showConfidence || (!score && !count)) return null;

    const getConfidenceColor = (s: number) => {
      if (s >= 0.8) return "bg-alert-green/20 text-alert-green";
      if (s >= 0.5) return "bg-amber/20 text-amber-600";
      return "bg-alert-red/20 text-alert-red";
    };

    const getConfidenceLabel = (s: number) => {
      if (s >= 0.8) return language === "kr" ? "Konfyans wo" : "High confidence";
      if (s >= 0.5) return language === "kr" ? "Konfyans mwayen" : "Medium confidence";
      return language === "kr" ? "Konfyans ba" : "Low confidence";
    };

    if (score) {
      return (
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${getConfidenceColor(score)}`}
          title={getConfidenceLabel(score)}
        >
          {Math.round(score * 100)}%
        </span>
      );
    }

    if (count) {
      return (
        <span className="text-xs text-indigo/50">
          {count} {language === "kr" ? "rapò" : "reports"}
        </span>
      );
    }

    return null;
  };

  const renderPriceCard = (
    data: PriceData | undefined,
    type: "official" | "user"
  ) => {
    const isOfficial = type === "official";
    const icon = isOfficial ? "\u25A0" : "\u25CF\u25CF"; // ■ or ●●
    const label = isOfficial
      ? language === "kr"
        ? "Ofisyèl (FEWS NET)"
        : "Official (FEWS NET)"
      : language === "kr"
      ? "Machann yo rapòte"
      : "Trader-reported";

    const bgColor = isOfficial ? "bg-indigo/5" : "bg-sage/10";
    const borderColor = isOfficial ? "border-indigo/20" : "border-sage/30";
    const accentColor = isOfficial ? "text-indigo" : "text-sage-600";

    if (!data) {
      return (
        <div
          className={`${bgColor} border ${borderColor} rounded-lg p-3 flex-1 min-w-[140px]`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">{icon}</span>
            <span className={`text-xs font-medium ${accentColor}`}>{label}</span>
          </div>
          <p className="text-indigo/40 text-sm italic">
            {language === "kr" ? "Pa gen done" : "No data"}
          </p>
        </div>
      );
    }

    return (
      <div
        className={`${bgColor} border ${borderColor} rounded-lg p-3 flex-1 min-w-[140px]`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">{icon}</span>
            <span className={`text-xs font-medium ${accentColor}`}>{label}</span>
          </div>
          {renderConfidenceBadge(data.confidenceScore, data.observationCount)}
        </div>

        <div className="flex items-baseline gap-1">
          <span className="font-mono text-xl font-bold text-indigo">
            {data.price.toLocaleString()}
          </span>
          <span className="text-sm text-indigo/60">HTG</span>
          <span className="text-xs text-indigo/40">/{data.unit}</span>
        </div>

        {data.lastUpdated && (
          <p className="text-xs text-indigo/40 mt-1">
            {new Date(data.lastUpdated).toLocaleDateString(
              language === "kr" ? "fr-HT" : "en-US",
              { month: "short", day: "numeric" }
            )}
          </p>
        )}
      </div>
    );
  };

  const renderPriceDifference = () => {
    if (!officialPrice || !userPrice) return null;

    const diff = userPrice.price - officialPrice.price;
    const percentDiff = ((diff / officialPrice.price) * 100).toFixed(1);
    const isHigher = diff > 0;
    const isSignificant = Math.abs(diff / officialPrice.price) > 0.05; // >5% difference

    if (!isSignificant) return null;

    return (
      <div className="flex items-center justify-center py-2">
        <div
          className={`
            text-xs px-3 py-1 rounded-full flex items-center gap-1
            ${isHigher ? "bg-alert-red/10 text-alert-red" : "bg-alert-green/10 text-alert-green"}
          `}
        >
          <span>{isHigher ? "\u2191" : "\u2193"}</span>
          <span>
            {language === "kr" ? "Diferans" : "Difference"}: {isHigher ? "+" : ""}
            {percentDiff}%
          </span>
        </div>
      </div>
    );
  };

  if (layout === "compact") {
    return (
      <div className="flex items-center gap-3 text-sm">
        {officialPrice && (
          <div className="flex items-center gap-1">
            <span className="text-xs">{"\u25A0"}</span>
            <span className="font-mono font-medium">
              {officialPrice.price.toLocaleString()}
            </span>
          </div>
        )}
        {userPrice && (
          <div className="flex items-center gap-1">
            <span className="text-xs">{"\u25CF\u25CF"}</span>
            <span className="font-mono font-medium text-sage-600">
              {userPrice.price.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    );
  }

  if (layout === "vertical") {
    return (
      <div className="space-y-2">
        <p className="text-xs text-indigo/60 font-medium">{commodityName}</p>
        {renderPriceCard(officialPrice, "official")}
        {renderPriceDifference()}
        {renderPriceCard(userPrice, "user")}
      </div>
    );
  }

  // Horizontal layout (default)
  return (
    <div className="space-y-2">
      <p className="text-xs text-indigo/60 font-medium">{commodityName}</p>
      <div className="flex gap-3 flex-wrap">
        {renderPriceCard(officialPrice, "official")}
        {renderPriceCard(userPrice, "user")}
      </div>
      {renderPriceDifference()}
    </div>
  );
}
