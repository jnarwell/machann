"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { suppliers, Supplier } from "@/data/suppliers";
import { getCommodityName } from "@/lib/utils/commodityNames";

export default function SupplierDirectory() {
  const { t, language } = useLanguage();

  const getLocalizedCommodityName = (commodityId: string) => {
    return getCommodityName(commodityId, language as "kr" | "en");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "kr" ? "fr-HT" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={i <= rating ? "text-amber" : "text-parchment-dark"}
        >
          &#9733;
        </span>
      );
    }
    return <span className="text-sm">{stars}</span>;
  };

  return (
    <div className="card p-4">
      <h3 className="font-display text-lg font-semibold text-indigo mb-4">
        {t("kominote.suppliers")}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {suppliers.map((supplier: Supplier) => (
          <div
            key={supplier.id}
            className="p-3 rounded-lg bg-parchment-dark/20 border border-parchment-dark/30 hover:border-terracotta/30 transition-colors"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-display font-semibold text-indigo">
                  {supplier.name}
                </h4>
                <p className="text-xs text-indigo/60">{supplier.location}</p>
              </div>
              <div className="text-right">
                <div>{renderStars(supplier.rating)}</div>
                <p className="text-xs text-indigo/50 mt-0.5">
                  {t("kominote.reliability")}
                </p>
              </div>
            </div>

            {/* Specialties */}
            <div className="mb-2">
              <p className="text-xs text-indigo/60 mb-1">
                {t("kominote.specialty")}:
              </p>
              <div className="flex flex-wrap gap-1">
                {supplier.specialties.map((spec) => (
                  <span
                    key={spec}
                    className="px-2 py-0.5 text-xs rounded-full bg-sage/20 text-sage-700"
                  >
                    {getLocalizedCommodityName(spec)}
                  </span>
                ))}
              </div>
            </div>

            {/* Last trade date */}
            <p className="text-xs text-indigo/60 mb-2">
              {t("kominote.lastTrade")}: {formatDate(supplier.lastTrade)}
            </p>

            {/* Notes */}
            <div className="p-2 rounded bg-parchment-light/50 border-l-2 border-amber/50">
              <p className="text-xs text-indigo/70 italic">
                {language === "kr" ? supplier.notes : supplier.notesEN}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
