"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useSol } from "@/hooks";
import { solGroup as fallbackGroup } from "@/data/sol";
import SolRing from "./SolRing";
import SolStats from "./SolStats";
import MemberList from "./MemberList";
import TradeLog from "./TradeLog";
import SupplierDirectory from "./SupplierDirectory";
import GroupMessages from "./GroupMessages";
import BusinessHealthDashboard from "./BusinessHealthDashboard";

export default function KominoteTab() {
  const { t, language } = useLanguage();
  const { group, isLoading, source } = useSol();

  // Use fetched group or fallback while loading
  const solGroup = group || fallbackGroup;

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-indigo">
          {t("kominote.title")}
        </h1>
        {/* Data source indicator */}
        <span className={`text-xs px-2 py-1 rounded ${
          source === "live"
            ? "bg-alert-green/20 text-alert-green"
            : "bg-amber/20 text-amber-700"
        }`}>
          {isLoading ? (language === "kr" ? "Chaje..." : "Loading...") :
            source === "live"
              ? (language === "kr" ? "\u2713 Viv" : "\u2713 Live")
              : (language === "kr" ? "\u26A0 Demo" : "\u26A0 Demo")}
        </span>
      </div>

      {/* Two-column layout: Sol Ring (left) + Members/Actions (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Sol Ring Visualization */}
        <div className="lg:col-span-1">
          <div className="card-indigo p-6">
            {/* Title with cycle info */}
            <div className="text-center mb-4">
              <h2 className="font-display text-xl font-bold text-parchment">
                {language === "kr"
                  ? solGroup.groupName
                  : `${solGroup.ownerName}'s Sol Group`}
              </h2>
              <p className="text-amber text-sm mt-1">
                {t("kominote.cycle")} {solGroup.currentCycle}{" "}
                {t("kominote.of")} {solGroup.totalCycles}
              </p>
            </div>

            {/* The Sol Ring SVG */}
            <SolRing
              members={solGroup.members}
              poolAmount={solGroup.poolPerCycle}
              currentRecipientIndex={solGroup.currentRecipientIndex}
            />

            {/* Stats Grid */}
            <SolStats group={solGroup} />
          </div>
        </div>

        {/* Right Column: Members + Trade Log + Supplier Directory */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section A: Group Members */}
          <MemberList members={solGroup.members} />

          {/* Section B: Business Health Dashboard */}
          <BusinessHealthDashboard />

          {/* Section C: Trade Log */}
          <TradeLog />

          {/* Section D: Supplier Directory */}
          <SupplierDirectory />

          {/* Group Messages */}
          <GroupMessages />
        </div>
      </div>
    </div>
  );
}
