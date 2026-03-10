"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { commodities } from "@/data/commodities";
import { markets } from "@/data/trades";
import { suppliers } from "@/data/suppliers";

interface EditTrade {
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

interface TradeFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  editTrade?: EditTrade;
}

export default function TradeForm({ onClose, onSuccess, editTrade }: TradeFormProps) {
  const { t, language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTransport, setShowTransport] = useState(false);

  const isEditing = !!editTrade;

  const [formData, setFormData] = useState({
    commodityId: "",
    qty: "",
    unit: "kg",
    supplier: "",
    marketBought: "",
    pricePaid: "",
    marketSold: "",
    priceReceived: "",
    // Transport fields
    transportCostHtg: "",
    transportMode: "",
    roadCondition: "",
    weatherCondition: "",
  });

  // Initialize form data from editTrade if provided
  useEffect(() => {
    if (editTrade) {
      setFormData({
        commodityId: editTrade.commodityId,
        qty: String(editTrade.qty),
        unit: editTrade.unit,
        supplier: editTrade.supplier?.name || "",
        marketBought: editTrade.marketBought,
        pricePaid: String(editTrade.pricePaid),
        marketSold: editTrade.marketSold,
        priceReceived: String(editTrade.priceReceived),
        transportCostHtg: editTrade.transportCostHtg ? String(editTrade.transportCostHtg) : "",
        transportMode: editTrade.transportMode || "",
        roadCondition: editTrade.roadCondition || "",
        weatherCondition: editTrade.weatherCondition || "",
      });
      // Show transport section if there's existing transport data
      if (editTrade.transportMode || editTrade.transportCostHtg || editTrade.roadCondition) {
        setShowTransport(true);
      }
    }
  }, [editTrade]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleRoadConditionSelect = (value: string) => {
    setFormData((prev) => ({ ...prev, roadCondition: value }));
  };

  // Validation function
  const validateForm = (): string | null => {
    const qty = parseFloat(formData.qty);
    const pricePaid = parseFloat(formData.pricePaid);
    const priceReceived = parseFloat(formData.priceReceived);
    const transportCost = formData.transportCostHtg ? parseFloat(formData.transportCostHtg) : 0;

    if (!formData.commodityId) {
      return language === "kr" ? "Chwazi yon pwodui" : "Select a commodity";
    }
    if (!formData.qty || isNaN(qty) || qty <= 0) {
      return language === "kr" ? "Kantite dwe pi gwo pase 0" : "Quantity must be greater than 0";
    }
    if (qty > 10000) {
      return language === "kr" ? "Kantite twò gwo (maks 10,000)" : "Quantity too large (max 10,000)";
    }
    if (!formData.supplier) {
      return language === "kr" ? "Chwazi yon founisè" : "Select a supplier";
    }
    if (!formData.marketBought) {
      return language === "kr" ? "Chwazi mache achte" : "Select market bought";
    }
    if (!formData.pricePaid || isNaN(pricePaid) || pricePaid <= 0) {
      return language === "kr" ? "Pri peye dwe pi gwo pase 0" : "Price paid must be greater than 0";
    }
    if (pricePaid > 100000) {
      return language === "kr" ? "Pri twò wo (maks 100,000 HTG)" : "Price too high (max 100,000 HTG)";
    }
    if (!formData.marketSold) {
      return language === "kr" ? "Chwazi mache vann" : "Select market sold";
    }
    if (!formData.priceReceived || isNaN(priceReceived) || priceReceived <= 0) {
      return language === "kr" ? "Pri resevwa dwe pi gwo pase 0" : "Price received must be greater than 0";
    }
    if (priceReceived > 100000) {
      return language === "kr" ? "Pri twò wo (maks 100,000 HTG)" : "Price too high (max 100,000 HTG)";
    }
    if (transportCost < 0) {
      return language === "kr" ? "Kou transpò pa ka negatif" : "Transport cost cannot be negative";
    }
    if (transportCost > 50000) {
      return language === "kr" ? "Kou transpò twò wo" : "Transport cost too high";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate before submitting
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...(isEditing && { id: editTrade.id }),
        commodityId: formData.commodityId,
        qty: formData.qty,
        unit: formData.unit,
        supplierName: formData.supplier,
        marketBought: formData.marketBought,
        pricePaid: formData.pricePaid,
        marketSold: formData.marketSold,
        priceReceived: formData.priceReceived,
        // Transport fields (only if provided)
        ...(formData.transportCostHtg && { transportCostHtg: formData.transportCostHtg }),
        ...(formData.transportMode && { transportMode: formData.transportMode }),
        ...(formData.roadCondition && { roadCondition: formData.roadCondition }),
        ...(formData.weatherCondition && { weatherCondition: formData.weatherCondition }),
      };

      const response = await fetch("/api/trades", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save trade");
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save trade");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatedMargin =
    formData.pricePaid && formData.priceReceived
      ? (
          ((parseFloat(formData.priceReceived) -
            parseFloat(formData.pricePaid)) /
            parseFloat(formData.pricePaid)) *
          100
        ).toFixed(1)
      : null;

  // Calculate net margin including transport
  const netMargin =
    formData.pricePaid && formData.priceReceived && formData.qty
      ? (() => {
          const revenue = parseFloat(formData.priceReceived) * parseFloat(formData.qty);
          const cost = parseFloat(formData.pricePaid) * parseFloat(formData.qty);
          const transport = formData.transportCostHtg ? parseFloat(formData.transportCostHtg) : 0;
          return (((revenue - cost - transport) / cost) * 100).toFixed(1);
        })()
      : null;

  const transportModes = [
    { value: "tap-tap", labelKr: "Tap-tap", labelEn: "Tap-tap" },
    { value: "moto", labelKr: "Moto", labelEn: "Motorcycle" },
    { value: "kamyon", labelKr: "Kamyon", labelEn: "Truck" },
    { value: "pye", labelKr: "A pye", labelEn: "On foot" },
    { value: "bato", labelKr: "Bato", labelEn: "Boat" },
  ];

  const roadConditions = [
    { value: "bon", labelKr: "Bon", labelEn: "Good", icon: "\u2713" },
    { value: "pasab", labelKr: "Pasab", labelEn: "Fair", icon: "~" },
    { value: "move", labelKr: "Move", labelEn: "Bad", icon: "!" },
    { value: "bloke", labelKr: "Bloke", labelEn: "Blocked", icon: "\u2715" },
  ];

  const weatherConditions = [
    { value: "soley", labelKr: "Soley", labelEn: "Sunny" },
    { value: "lapli", labelKr: "Lapli", labelEn: "Rain" },
    { value: "inondasyon", labelKr: "Inondasyon", labelEn: "Flooding" },
    { value: "van_fo", labelKr: "Van fo", labelEn: "High winds" },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-parchment-dark/30 rounded-lg p-4 border border-parchment-dark/50"
    >
      {/* Form header for edit mode */}
      {isEditing && (
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-parchment-dark/30">
          <span className="text-amber">{"\u270E"}</span>
          <span className="text-sm font-display text-indigo">
            {language === "kr" ? "Modifye tranzaksyon" : "Edit trade"}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Commodity */}
        <div>
          <label className="block text-xs text-indigo/70 mb-1">
            {t("kominote.commodity")}
          </label>
          <select
            name="commodityId"
            value={formData.commodityId}
            onChange={handleChange}
            className="w-full px-2 py-1.5 text-sm rounded border border-parchment-dark bg-parchment-light text-indigo"
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

        {/* Quantity */}
        <div>
          <label className="block text-xs text-indigo/70 mb-1">
            {t("kominote.qty")}
          </label>
          <div className="flex gap-1">
            <input
              type="number"
              name="qty"
              value={formData.qty}
              onChange={handleChange}
              className="w-full px-2 py-1.5 text-sm rounded border border-parchment-dark bg-parchment-light text-indigo font-mono"
              placeholder="0"
              required
              min="0.1"
              max="10000"
              step="0.1"
            />
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="px-2 py-1.5 text-sm rounded border border-parchment-dark bg-parchment-light text-indigo"
            >
              <option value="kg">kg</option>
              <option value="lit">lit</option>
              <option value="paket">paket</option>
              <option value="galon">galon</option>
            </select>
          </div>
        </div>

        {/* Supplier */}
        <div>
          <label className="block text-xs text-indigo/70 mb-1">
            {t("kominote.supplier")}
          </label>
          <select
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            className="w-full px-2 py-1.5 text-sm rounded border border-parchment-dark bg-parchment-light text-indigo"
            required
          >
            <option value="">--</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Market Bought */}
        <div>
          <label className="block text-xs text-indigo/70 mb-1">
            {t("kominote.marketBought")}
          </label>
          <select
            name="marketBought"
            value={formData.marketBought}
            onChange={handleChange}
            className="w-full px-2 py-1.5 text-sm rounded border border-parchment-dark bg-parchment-light text-indigo"
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

        {/* Price Paid */}
        <div>
          <label className="block text-xs text-indigo/70 mb-1">
            {t("kominote.pricePaid")} (HTG)
          </label>
          <input
            type="number"
            name="pricePaid"
            value={formData.pricePaid}
            onChange={handleChange}
            className="w-full px-2 py-1.5 text-sm rounded border border-parchment-dark bg-parchment-light text-indigo font-mono"
            placeholder="0"
            required
            min="1"
            max="100000"
            step="0.01"
          />
        </div>

        {/* Market Sold */}
        <div>
          <label className="block text-xs text-indigo/70 mb-1">
            {t("kominote.marketSold")}
          </label>
          <select
            name="marketSold"
            value={formData.marketSold}
            onChange={handleChange}
            className="w-full px-2 py-1.5 text-sm rounded border border-parchment-dark bg-parchment-light text-indigo"
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

        {/* Price Received */}
        <div>
          <label className="block text-xs text-indigo/70 mb-1">
            {t("kominote.priceReceived")} (HTG)
          </label>
          <input
            type="number"
            name="priceReceived"
            value={formData.priceReceived}
            onChange={handleChange}
            className="w-full px-2 py-1.5 text-sm rounded border border-parchment-dark bg-parchment-light text-indigo font-mono"
            placeholder="0"
            required
            min="1"
            max="100000"
            step="0.01"
          />
        </div>

        {/* Calculated Margin */}
        <div className="flex items-end">
          <div className="w-full">
            <label className="block text-xs text-indigo/70 mb-1">
              {t("kominote.margin")}
            </label>
            <div
              className={`px-2 py-1.5 text-sm rounded border font-mono font-semibold ${
                calculatedMargin && parseFloat(calculatedMargin) > 0
                  ? "border-alert-green bg-alert-green/10 text-alert-green"
                  : calculatedMargin && parseFloat(calculatedMargin) < 0
                  ? "border-alert-red bg-alert-red/10 text-alert-red"
                  : "border-parchment-dark bg-parchment-dark/30 text-indigo/50"
              }`}
            >
              {calculatedMargin ? `${calculatedMargin}%` : "--"}
            </div>
          </div>
        </div>
      </div>

      {/* Transport Section - Progressive Disclosure */}
      {formData.marketBought && formData.marketSold && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowTransport(!showTransport)}
            className="flex items-center gap-2 text-sm text-indigo/60 hover:text-indigo transition-colors"
          >
            <span className={`transition-transform ${showTransport ? "rotate-90" : ""}`}>
              {"\u25B6"}
            </span>
            {language === "kr" ? "Enfòmasyon transpò" : "Transport info"}
            <span className="text-xs text-indigo/40">(opsyonèl)</span>
          </button>

          {showTransport && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 p-3 bg-parchment-dark/20 rounded-lg border border-parchment-dark/30">
              {/* Transport Mode */}
              <div>
                <label className="block text-xs text-indigo/70 mb-1">
                  {language === "kr" ? "Mòd transpò" : "Transport mode"}
                </label>
                <select
                  name="transportMode"
                  value={formData.transportMode}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 text-sm rounded border border-parchment-dark bg-parchment-light text-indigo"
                >
                  <option value="">--</option>
                  {transportModes.map((mode) => (
                    <option key={mode.value} value={mode.value}>
                      {language === "kr" ? mode.labelKr : mode.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Transport Cost */}
              <div>
                <label className="block text-xs text-indigo/70 mb-1">
                  {language === "kr" ? "Kou transpò" : "Transport cost"} (HTG)
                </label>
                <input
                  type="number"
                  name="transportCostHtg"
                  value={formData.transportCostHtg}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 text-sm rounded border border-parchment-dark bg-parchment-light text-indigo font-mono"
                  placeholder="0"
                  min="0"
                  max="50000"
                  step="1"
                />
              </div>

              {/* Road Condition */}
              <div>
                <label className="block text-xs text-indigo/70 mb-1">
                  {language === "kr" ? "Kondisyon wout" : "Road condition"}
                </label>
                <div className="flex gap-1">
                  {roadConditions.map((cond) => (
                    <button
                      type="button"
                      key={cond.value}
                      onClick={() => handleRoadConditionSelect(cond.value)}
                      className={`flex-1 px-1.5 py-1.5 text-xs rounded border transition-colors ${
                        formData.roadCondition === cond.value
                          ? "bg-terracotta text-parchment border-terracotta"
                          : "border-parchment-dark bg-parchment-light text-indigo/70 hover:bg-parchment-dark/30"
                      }`}
                      title={language === "kr" ? cond.labelKr : cond.labelEn}
                    >
                      {cond.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weather */}
              <div>
                <label className="block text-xs text-indigo/70 mb-1">
                  {language === "kr" ? "Tan" : "Weather"}
                </label>
                <select
                  name="weatherCondition"
                  value={formData.weatherCondition}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 text-sm rounded border border-parchment-dark bg-parchment-light text-indigo"
                >
                  <option value="">--</option>
                  {weatherConditions.map((w) => (
                    <option key={w.value} value={w.value}>
                      {language === "kr" ? w.labelKr : w.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Net Margin (if transport cost entered) */}
              {formData.transportCostHtg && netMargin && (
                <div className="col-span-full mt-2 p-2 bg-indigo/5 rounded text-sm">
                  <span className="text-indigo/60">
                    {language === "kr" ? "Maj nèt (apre transpò):" : "Net margin (after transport):"}
                  </span>
                  <span className={`ml-2 font-mono font-semibold ${
                    parseFloat(netMargin) > 0 ? "text-alert-green" : "text-alert-red"
                  }`}>
                    {netMargin}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-2 bg-alert-red/10 border border-alert-red/30 rounded text-alert-red text-sm">
          {error}
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="px-4 py-1.5 text-sm rounded border border-parchment-dark text-indigo/70 hover:bg-parchment-dark/30 transition-colors disabled:opacity-50"
        >
          {language === "kr" ? "Anile" : "Cancel"}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-1.5 text-sm rounded font-display transition-colors disabled:opacity-50 ${
            isEditing
              ? "bg-amber text-indigo hover:bg-amber/90"
              : "bg-sage text-parchment hover:bg-sage-600"
          }`}
        >
          {isSubmitting
            ? (language === "kr" ? "Anrejistre..." : "Saving...")
            : isEditing
              ? (language === "kr" ? "Mizajou" : "Update")
              : (language === "kr" ? "Anrejistre" : "Save Trade")}
        </button>
      </div>
    </form>
  );
}
