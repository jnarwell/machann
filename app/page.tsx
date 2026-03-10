"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import TabNavigation from "@/components/layout/TabNavigation";
import PriMacheTab from "@/components/tabs/PriMache";
import KominoteTab from "@/components/tabs/Kominote";
import FinansTab from "@/components/tabs/Finans";
import AkteEkonomikTab from "@/components/tabs/AkteEkonomik";
import RechechTab from "@/components/tabs/Rechech";

export default function Home() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };

  // Render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <PriMacheTab />;
      case 1:
        return <KominoteTab />;
      case 2:
        return <FinansTab />;
      case 3:
        return <AkteEkonomikTab />;
      case 4:
        return <RechechTab />;
      default:
        return <PriMacheTab />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {renderTabContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-indigo text-parchment/70 py-4 px-4 text-center text-sm font-body relative z-10">
        <p>
          Machann Enfomasyon &copy; 2026 &mdash; Yon pwojè HIS 275, Stanford University
        </p>
        <p className="text-xs mt-1 text-parchment/50">
          Done: WFP / CNSA / World Bank RTFP | Patnè: RAMSA, Fonkoze
        </p>
      </footer>
    </div>
  );
}
