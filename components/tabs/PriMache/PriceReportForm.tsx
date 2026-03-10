"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";
import { commodities } from "@/data/commodities";
import { markets } from "@/data/trades";

interface PriceReportFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  prefillCommodity?: string;
  prefillMarket?: string;
}

const regions = [
  { id: "portauprince", nameKr: "Potoprens", nameEn: "Port-au-Prince" },
  { id: "artibonite", nameKr: "Atibonit", nameEn: "Artibonite" },
  { id: "north", nameKr: "Nò", nameEn: "North" },
  { id: "south", nameKr: "Sid", nameEn: "South" },
  { id: "west", nameKr: "Lwès", nameEn: "West" },
  { id: "center", nameKr: "Sant", nameEn: "Center" },
  { id: "northeast", nameKr: "Nòdès", nameEn: "Northeast" },
  { id: "northwest", nameKr: "Nòdwès", nameEn: "Northwest" },
  { id: "southeast", nameKr: "Sidès", nameEn: "Southeast" },
  { id: "grandanse", nameKr: "Grandans", nameEn: "Grand'Anse" },
];

export default function PriceReportForm({
  onClose,
  onSuccess,
  prefillCommodity,
  prefillMarket,
}: PriceReportFormProps) {
  const { language } = useLanguage();
  const { currentUser } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    commodityId: prefillCommodity || "",
    market: prefillMarket || "",
    regionId: "portauprince",
    price: "",
    unit: "kg",
    quality: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/price-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commodityId: formData.commodityId,
          market: formData.market,
          regionId: formData.regionId,
          price: formData.price,
          unit: formData.unit,
          quality: formData.quality || undefined,
          notes: formData.notes || undefined,
          userId: currentUser?.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit report");
      }

      setSuccess(true);
      setFormData({
        commodityId: "",
        market: "",
        regionId: "portauprince",
        price: "",
        unit: "kg",
        quality: "",
        notes: "",
      });
      onSuccess?.();

      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const qualities = [
    { value: "excellent", labelKr: "Ekselan", labelEn: "Excellent" },
    { value: "good", labelKr: "Bon", labelEn: "Good" },
    { value: "fair", labelKr: "Pasab", labelEn: "Fair" },
    { value: "poor", labelKr: "Pa bon", labelEn: "Poor" },
  ];

  return (
    <div className="bg-sage/10 border-l-4 border-sage rounded-r-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-display text-sm font-semibold text-indigo flex items-center gap-2">
          <span className="text-sage">{"\u270E"}</span>
          {language === "kr" ? "Rapò Pri Rapid" : "Quick Price Report"}
        </h4>
        <button
          onClick={onClose}
          className="text-indigo/40 hover:text-indigo transition-colors"
        >
          {"\u2715"}
        </button>
      </div>

      <p className="text-xs text-indigo/60 mb-3">
        {language === "kr"
          ? "Ede lòt machann konnen pri jodi a"
          : "Help other traders know today's prices"}
      </p>

      {success && (
        <div className="mb-3 p-2 bg-alert-green/10 border border-alert-green/30 rounded text-alert-green text-sm flex items-center gap-2">
          <span>{"\u2713"}</span>
          {language === "kr" ? "Rapò soumèt avèk siksè!" : "Report submitted successfully!"}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* Commodity */}
          <div>
            <label className="block text-xs text-indigo/70 mb-1">
              {language === "kr" ? "Pwodui" : "Commodity"}
            </label>
            <select
              name="commodityId"
              value={formData.commodityId}
              onChange={handleChange}
              className="w-full px-2 py-1.5 text-sm rounded border border-sage/50 bg-parchment-light text-indigo"
              required
            >
              <option value="">--</option>
              {commodities.map((c) => (
                <option key={c.id} value={c.id}>
                  {language === "kr" ? c.nameKR : c.nameEN}
                </option>
              ))}
            </select>
          </div>

          {/* Market */}
          <div>
            <label className="block text-xs text-indigo/70 mb-1">
              {language === "kr" ? "Mache" : "Market"}
            </label>
            <select
              name="market"
              value={formData.market}
              onChange={handleChange}
              className="w-full px-2 py-1.5 text-sm rounded border border-sage/50 bg-parchment-light text-indigo"
              required
            >
              <option value="">--</option>
              {markets.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Region */}
          <div>
            <label className="block text-xs text-indigo/70 mb-1">
              {language === "kr" ? "Rejyon" : "Region"}
            </label>
            <select
              name="regionId"
              value={formData.regionId}
              onChange={handleChange}
              className="w-full px-2 py-1.5 text-sm rounded border border-sage/50 bg-parchment-light text-indigo"
              required
            >
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {language === "kr" ? r.nameKr : r.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Price with unit */}
          <div>
            <label className="block text-xs text-indigo/70 mb-1">
              {language === "kr" ? "Pri" : "Price"} (HTG)
            </label>
            <div className="flex gap-1">
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-2 py-1.5 text-sm rounded border border-sage/50 bg-parchment-light text-indigo font-mono"
                placeholder="0"
                required
                min="0"
                step="0.01"
              />
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-16 px-1 py-1.5 text-xs rounded border border-sage/50 bg-parchment-light text-indigo"
              >
                <option value="kg">kg</option>
                <option value="lit">lit</option>
                <option value="paket">paket</option>
                <option value="galon">galon</option>
              </select>
            </div>
          </div>

          {/* Quality (optional) */}
          <div>
            <label className="block text-xs text-indigo/70 mb-1">
              {language === "kr" ? "Kalite" : "Quality"}
              <span className="text-indigo/40 ml-1">(opsyonèl)</span>
            </label>
            <select
              name="quality"
              value={formData.quality}
              onChange={handleChange}
              className="w-full px-2 py-1.5 text-sm rounded border border-sage/50 bg-parchment-light text-indigo"
            >
              <option value="">--</option>
              {qualities.map((q) => (
                <option key={q.value} value={q.value}>
                  {language === "kr" ? q.labelKr : q.labelEn}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-3 py-1.5 bg-sage text-parchment rounded text-sm font-display hover:bg-sage-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">{"\u21BB"}</span>
                  {language === "kr" ? "Ap soumèt..." : "Submitting..."}
                </>
              ) : (
                <>
                  {"\u2713"}
                  {language === "kr" ? "Soumèt" : "Submit"}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Notes (optional, collapsible) */}
        <details className="group">
          <summary className="text-xs text-indigo/50 cursor-pointer hover:text-indigo/70">
            {language === "kr" ? "Ajoute nòt (opsyonèl)" : "Add notes (optional)"}
          </summary>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            className="w-full mt-2 px-2 py-1.5 text-sm rounded border border-sage/50 bg-parchment-light text-indigo resize-none"
            placeholder={language === "kr" ? "Nòt adisyonèl..." : "Additional notes..."}
          />
        </details>

        {/* Error Message */}
        {error && (
          <div className="p-2 bg-alert-red/10 border border-alert-red/30 rounded text-alert-red text-sm">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
