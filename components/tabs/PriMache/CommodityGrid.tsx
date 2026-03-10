"use client";

import React, { useMemo, useState } from "react";
import { commodities as fallbackCommodities, Commodity } from "@/data/commodities";
import { CommodityPrice } from "@/lib/api/types";
import CommodityCard from "./CommodityCard";
import CommodityDetailModal from "./CommodityDetailModal";

interface CommodityGridProps {
  prices?: CommodityPrice[];
  selectedRegion?: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dataSource?: "official" | "user" | "blended";
  onReportPrice?: (commodityId: string) => void;
}

type CommodityData = Commodity | CommodityPrice;

export default function CommodityGrid({
  prices,
  selectedRegion = "all",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dataSource = "official",
  onReportPrice,
}: CommodityGridProps) {
  const [selectedCommodity, setSelectedCommodity] = useState<CommodityData | null>(null);

  // Use provided prices or fall back to static data
  const rawData = prices?.length ? prices : fallbackCommodities;

  // Apply region filter - adjust currentPrice to show regional price when filtered
  const commodityData = useMemo(() => {
    if (selectedRegion === "all") {
      return rawData;
    }

    // Map region filter to regionalPrices key
    const regionKey = selectedRegion as keyof CommodityPrice["regionalPrices"];

    return rawData.map((commodity) => {
      const regionalPrice = commodity.regionalPrices?.[regionKey];

      // If we have a regional price, use it as currentPrice
      if (regionalPrice !== undefined && regionalPrice !== null) {
        return {
          ...commodity,
          currentPrice: regionalPrice,
        };
      }

      // If no regional price available, still show but with original price
      return commodity;
    });
  }, [rawData, selectedRegion]);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {commodityData.map((commodity) => (
          <CommodityCard
            key={commodity.id}
            commodity={commodity}
            selectedRegion={selectedRegion}
            onClick={() => setSelectedCommodity(commodity)}
          />
        ))}
      </div>

      {/* Commodity Detail Modal */}
      {selectedCommodity && (
        <CommodityDetailModal
          commodity={selectedCommodity}
          isOpen={!!selectedCommodity}
          onClose={() => setSelectedCommodity(null)}
          onReportPrice={onReportPrice ? () => {
            onReportPrice(selectedCommodity.id);
            setSelectedCommodity(null);
          } : undefined}
        />
      )}
    </>
  );
}
