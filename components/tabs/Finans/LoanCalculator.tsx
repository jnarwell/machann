"use client";

import React, { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useExchange } from "@/hooks";

// Default Ti Kredi values (~$75 USD)
const DEFAULT_LOAN_HTG = 9930;
const DEFAULT_DURATION_MONTHS = 12;
const DEFAULT_MONTHLY_RATE = 5; // 5% monthly

// Validation limits
const MIN_LOAN = 1000;
const MAX_LOAN = 500000;
const MIN_RATE = 0.5;
const MAX_RATE = 20;

// Fallback rate if API unavailable
const FALLBACK_EXCHANGE_RATE = 132;

export default function LoanCalculator() {
  const { language, t } = useLanguage();
  const { rates } = useExchange();

  const [loanAmount, setLoanAmount] = useState<number>(DEFAULT_LOAN_HTG);
  const [duration, setDuration] = useState<number>(DEFAULT_DURATION_MONTHS);
  const [monthlyRate, setMonthlyRate] = useState<number>(DEFAULT_MONTHLY_RATE);

  // Use live exchange rate or fallback
  const exchangeRate = rates?.official || FALLBACK_EXCHANGE_RATE;

  // Validation
  const validation = useMemo(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (loanAmount < MIN_LOAN) {
      errors.push(language === "kr"
        ? `Montan minimòm: ${MIN_LOAN.toLocaleString()} HTG`
        : `Minimum amount: ${MIN_LOAN.toLocaleString()} HTG`);
    }
    if (loanAmount > MAX_LOAN) {
      errors.push(language === "kr"
        ? `Montan maksimòm: ${MAX_LOAN.toLocaleString()} HTG`
        : `Maximum amount: ${MAX_LOAN.toLocaleString()} HTG`);
    }
    if (monthlyRate < MIN_RATE) {
      errors.push(language === "kr"
        ? `To minimòm: ${MIN_RATE}%`
        : `Minimum rate: ${MIN_RATE}%`);
    }
    if (monthlyRate > MAX_RATE) {
      errors.push(language === "kr"
        ? `To maksimòm: ${MAX_RATE}%`
        : `Maximum rate: ${MAX_RATE}%`);
    }

    // Warnings for high interest
    if (monthlyRate > 10) {
      warnings.push(language === "kr"
        ? "To enterè wo anpil - reflechi byen"
        : "Very high interest rate - consider carefully");
    }

    return { errors, warnings, isValid: errors.length === 0 };
  }, [loanAmount, monthlyRate, language]);

  // Calculate monthly payment and total cost
  const calculations = useMemo(() => {
    if (!validation.isValid) {
      return {
        monthlyPayment: 0,
        totalCost: 0,
        totalInterest: 0,
        monthlyTradeVolumeNeeded: 0,
      };
    }

    const rate = monthlyRate / 100;

    // Simple interest calculation (typical for microfinance)
    // Total interest = Principal * Rate * Time (in months)
    const totalInterest = loanAmount * rate * duration;
    const totalCost = loanAmount + totalInterest;
    const monthlyPayment = totalCost / duration;

    // Estimated trade profit needed per month to cover payment
    // Assuming a 15% profit margin on trades
    const profitMarginAssumption = 0.15;
    const monthlyTradeVolumeNeeded = monthlyPayment / profitMarginAssumption;

    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalCost: Math.round(totalCost),
      totalInterest: Math.round(totalInterest),
      monthlyTradeVolumeNeeded: Math.round(monthlyTradeVolumeNeeded),
    };
  }, [loanAmount, duration, monthlyRate, validation.isValid]);

  const formatHTG = (amount: number) => {
    return amount.toLocaleString("fr-HT");
  };

  const handleLoanAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty input for better UX
    if (value === "") {
      setLoanAmount(0);
      return;
    }
    const num = Number(value);
    if (!isNaN(num) && num >= 0) {
      setLoanAmount(num);
    }
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setMonthlyRate(0);
      return;
    }
    const num = Number(value);
    if (!isNaN(num) && num >= 0) {
      setMonthlyRate(num);
    }
  };

  return (
    <div className="card p-5 space-y-5">
      <h3 className="font-display text-lg text-indigo font-semibold">
        {t("finans.calculator.title")}
      </h3>

      {/* Input fields */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Loan Amount */}
        <div className="space-y-2">
          <label className="block text-sm text-indigo/70">
            {t("finans.calculator.amount")} (HTG)
          </label>
          <input
            type="number"
            value={loanAmount || ""}
            onChange={handleLoanAmountChange}
            className={`w-full px-3 py-2 border rounded-lg bg-parchment-light font-mono text-indigo focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta ${
              loanAmount < MIN_LOAN || loanAmount > MAX_LOAN
                ? "border-alert-red/50"
                : "border-parchment-dark/40"
            }`}
            min={MIN_LOAN}
            max={MAX_LOAN}
            step={100}
            placeholder={String(MIN_LOAN)}
          />
          <p className="text-xs text-indigo/50">
            ≈ ${Math.round(loanAmount / exchangeRate)} USD
          </p>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <label className="block text-sm text-indigo/70">
            {t("finans.calculator.duration")}
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full px-3 py-2 border border-parchment-dark/40 rounded-lg bg-parchment-light font-mono text-indigo focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
          >
            {[3, 6, 9, 12, 18, 24].map((months) => (
              <option key={months} value={months}>
                {months} {language === "kr" ? "mwa" : "months"}
              </option>
            ))}
          </select>
        </div>

        {/* Monthly Rate */}
        <div className="space-y-2">
          <label className="block text-sm text-indigo/70">
            {t("finans.rate")} (% {t("finans.monthly")})
          </label>
          <input
            type="number"
            value={monthlyRate || ""}
            onChange={handleRateChange}
            className={`w-full px-3 py-2 border rounded-lg bg-parchment-light font-mono text-indigo focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta ${
              monthlyRate < MIN_RATE || monthlyRate > MAX_RATE
                ? "border-alert-red/50"
                : monthlyRate > 10
                ? "border-amber/50"
                : "border-parchment-dark/40"
            }`}
            min={MIN_RATE}
            max={MAX_RATE}
            step={0.5}
            placeholder={String(MIN_RATE)}
          />
        </div>
      </div>

      {/* Validation errors and warnings */}
      {validation.errors.length > 0 && (
        <div className="p-3 bg-alert-red/10 border border-alert-red/30 rounded-lg">
          {validation.errors.map((error, i) => (
            <p key={i} className="text-sm text-alert-red flex items-center gap-2">
              <span>{"\u26A0"}</span> {error}
            </p>
          ))}
        </div>
      )}

      {validation.warnings.length > 0 && validation.isValid && (
        <div className="p-3 bg-amber/10 border border-amber/30 rounded-lg">
          {validation.warnings.map((warning, i) => (
            <p key={i} className="text-sm text-amber-700 flex items-center gap-2">
              <span>{"\u26A0"}</span> {warning}
            </p>
          ))}
        </div>
      )}

      {/* Results */}
      {validation.isValid && (
        <div className="bg-sage-50 rounded-lg p-4 border border-sage-200">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Monthly Payment */}
            <div className="text-center md:text-left">
              <div className="text-xs text-sage-700 uppercase tracking-wide mb-1">
                {t("finans.calculator.monthlyPayment")}
              </div>
              <div className="font-mono text-2xl font-bold text-sage-700">
                {formatHTG(calculations.monthlyPayment)} HTG
              </div>
              <div className="text-xs text-sage-600">
                ≈ ${Math.round(calculations.monthlyPayment / exchangeRate)} USD
              </div>
            </div>

            {/* Total Cost */}
            <div className="text-center md:text-left">
              <div className="text-xs text-sage-700 uppercase tracking-wide mb-1">
                {t("finans.calculator.totalCost")}
              </div>
              <div className="font-mono text-2xl font-bold text-sage-700">
                {formatHTG(calculations.totalCost)} HTG
              </div>
              <div className="text-xs text-sage-600">
                +{formatHTG(calculations.totalInterest)} HTG{" "}
                {language === "kr" ? "enterè" : "interest"}
              </div>
            </div>

            {/* Trade Volume Needed */}
            <div className="text-center md:text-left">
              <div className="text-xs text-amber-700 uppercase tracking-wide mb-1">
                {language === "kr" ? "Pwofi komès pa mwa" : "Monthly trade profit needed"}
              </div>
              <div className="font-mono text-2xl font-bold text-amber-600">
                {formatHTG(calculations.monthlyTradeVolumeNeeded)} HTG
              </div>
              <div className="text-xs text-amber-600">
                {language === "kr"
                  ? "baze sou 15% maji"
                  : "based on 15% margin"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ti Kredi default note */}
      <p className="text-xs text-indigo/50 text-center">
        {language === "kr"
          ? `Valè default yo baze sou Ti Kredi Fonkoze (~$75 USD). To: 1 USD = ${exchangeRate.toFixed(1)} HTG`
          : `Default values based on Fonkoze Ti Kredi (~$75 USD). Rate: 1 USD = ${exchangeRate.toFixed(1)} HTG`}
      </p>
    </div>
  );
}
