"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { commodities as fallbackCommodities, Commodity } from "@/data/commodities";
import { CommodityPrice } from "@/lib/api/types";

interface AlertBannerProps {
  prices?: CommodityPrice[];
  alertCommodity?: Commodity;
}

export default function AlertBanner({ prices, alertCommodity }: AlertBannerProps) {
  const { language, t } = useLanguage();

  // Use provided prices or fall back to static data
  const commodityData = prices?.length ? prices : fallbackCommodities;

  // Find the commodity with the highest price spike (>15% in 30 days)
  const commodity =
    alertCommodity ||
    commodityData.find((c) => (c.change30d ?? 0) > 15) ||
    commodityData.reduce((max, c) =>
      (c.change30d ?? 0) > (max.change30d ?? 0) ? c : max
    );

  if (!commodity || (commodity.change30d ?? 0) <= 15) {
    return null;
  }

  const name = language === "kr" ? commodity.nameKR : commodity.nameEN;
  const nameSecondary = language === "kr" ? commodity.nameEN : commodity.nameKR;

  return (
    <div
      className="bg-amber-100 border-l-4 border-amber rounded-r-lg p-4 shadow-sm"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0 text-amber-600" aria-hidden="true">
          {"\u26A0"}
        </span>
        <div className="flex-1">
          <p className="font-body text-indigo">
            <span className="font-semibold">{name}</span>
            <span className="text-indigo/60 text-sm"> ({nameSecondary})</span>
            {" "}
            {language === "kr" ? (
              <>
                nan mache Pòtoprens{" "}
                <span className="font-semibold text-alert-red">
                  monte {commodity.change30d}%
                </span>{" "}
                {t("priMache.in30Days")} — {t("priMache.alert.reason")}.
              </>
            ) : (
              <>
                in Port-au-Prince market is{" "}
                <span className="font-semibold text-alert-red">
                  up {commodity.change30d}%
                </span>{" "}
                {t("priMache.in30Days")} — {t("priMache.alert.reason")}.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
