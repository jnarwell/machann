"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { commodities as fallbackCommodities } from "@/data/commodities";
import { CommodityPrice } from "@/lib/api/types";

interface RegionalPriceTableProps {
  prices?: CommodityPrice[];
}

export default function RegionalPriceTable({ prices }: RegionalPriceTableProps) {
  const { language } = useLanguage();

  // Use provided prices or fall back to static data
  const commodityData = prices?.length ? prices : fallbackCommodities;

  // Column headers - include all regions from filter
  const columns = [
    { key: "commodity", labelKR: "Pwodui", labelEN: "Commodity" },
    { key: "portauprince", labelKR: "Pòtoprens", labelEN: "Port-au-Prince" },
    { key: "artibonite", labelKR: "Atibonit", labelEN: "Artibonite" },
    { key: "north", labelKR: "Nò", labelEN: "North" },
    { key: "south", labelKR: "Sid", labelEN: "South" },
    { key: "center", labelKR: "Sant", labelEN: "Center" },
    { key: "northwest", labelKR: "Nòdwès", labelEN: "Northwest" },
    { key: "spread", labelKR: "Diferans", labelEN: "Spread" },
  ];

  // Calculate spread (max - min price) with fixed precision
  const calculateSpread = (regionalPrices: CommodityPrice["regionalPrices"]) => {
    const values = [
      regionalPrices.portauprince,
      regionalPrices.artibonite,
      regionalPrices.north,
      regionalPrices.south,
      regionalPrices.center,
      regionalPrices.northwest,
    ].filter((v): v is number => v !== null && v !== undefined);
    if (values.length === 0) return 0;
    const max = Math.max(...values);
    const min = Math.min(...values);
    // Fix floating point precision
    return Math.round((max - min) * 100) / 100;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-indigo/20">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`
                  py-3 px-2 text-left font-display font-semibold text-indigo
                  ${col.key === "spread" ? "bg-amber-50 text-amber-700" : ""}
                  ${col.key === "commodity" ? "sticky left-0 bg-parchment-light z-10" : ""}
                `}
              >
                {language === "kr" ? col.labelKR : col.labelEN}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {commodityData.map((commodity, index) => {
            const name = language === "kr" ? commodity.nameKR : commodity.nameEN;
            const spread = calculateSpread(commodity.regionalPrices);
            const prices = commodity.regionalPrices;

            // Find min and max for highlighting
            const priceValues = [
              prices.portauprince,
              prices.artibonite,
              prices.north,
              prices.south,
              prices.center,
              prices.northwest,
            ].filter((v): v is number => v !== null && v !== undefined);
            const maxPrice = priceValues.length ? Math.max(...priceValues) : 0;
            const minPrice = priceValues.length ? Math.min(...priceValues) : 0;

            const regionMapping = [
              { key: "portauprince", value: prices.portauprince },
              { key: "artibonite", value: prices.artibonite },
              { key: "north", value: prices.north },
              { key: "south", value: prices.south },
              { key: "center", value: prices.center },
              { key: "northwest", value: prices.northwest },
            ];

            return (
              <tr
                key={commodity.id}
                className={`
                  border-b border-indigo/10 hover:bg-parchment-dark/30 transition-colors
                  ${index % 2 === 0 ? "bg-parchment-light/50" : ""}
                `}
              >
                {/* Commodity name with icon */}
                <td className="py-3 px-2 sticky left-0 bg-inherit z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{commodity.icon}</span>
                    <span className="font-medium text-indigo">{name}</span>
                  </div>
                </td>

                {/* Regional prices */}
                {regionMapping.map(({ key, value }) => {
                  const isMax = value !== null && value === maxPrice;
                  const isMin = value !== null && value === minPrice;

                  return (
                    <td
                      key={key}
                      className={`
                        py-3 px-2 font-mono text-right
                        ${isMax ? "text-alert-red font-semibold" : ""}
                        ${isMin ? "text-alert-green font-semibold" : ""}
                        ${!isMax && !isMin ? "text-indigo" : ""}
                      `}
                    >
                      {value != null ? value.toLocaleString() : "---"}
                    </td>
                  );
                })}

                {/* Spread column - highlighted */}
                <td className="py-3 px-2 font-mono text-right bg-amber-50 text-amber-700 font-semibold">
                  {spread > 0 ? `+${spread}` : spread}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-indigo/60">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-alert-red/20"></span>
          <span>{language === "kr" ? "Pi wo" : "Highest"}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-alert-green/20"></span>
          <span>{language === "kr" ? "Pi ba" : "Lowest"}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-amber/20"></span>
          <span>{language === "kr" ? "Diferans = okazyon abitraj" : "Spread = arbitrage opportunity"}</span>
        </div>
      </div>
    </div>
  );
}
