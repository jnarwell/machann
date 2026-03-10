"use client";

import { useState, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TranslationKey } from "@/data/i18n";

// Tab configuration with translation keys
const tabs: { id: string; labelKey: TranslationKey }[] = [
  { id: "priMache", labelKey: "nav.priMache" },
  { id: "kominote", labelKey: "nav.kominote" },
  { id: "finans", labelKey: "nav.finans" },
  { id: "akteEkonomik", labelKey: "nav.akteEkonomik" },
  { id: "rechech", labelKey: "nav.rechech" },
];

interface TabNavigationProps {
  activeTab?: number;
  onTabChange?: (index: number, tabId: string) => void;
}

export default function TabNavigation({
  activeTab: controlledActiveTab,
  onTabChange,
}: TabNavigationProps) {
  const { t } = useLanguage();

  // Internal state for uncontrolled usage
  const [internalActiveTab, setInternalActiveTab] = useState(0);

  // Use controlled value if provided, otherwise use internal state
  const activeTab =
    controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

  const handleTabClick = useCallback(
    (index: number) => {
      if (controlledActiveTab === undefined) {
        setInternalActiveTab(index);
      }
      onTabChange?.(index, tabs[index].id);
    },
    [controlledActiveTab, onTabChange]
  );

  return (
    <nav className="sticky top-0 z-40 bg-parchment border-b border-parchment-dark/30 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(index)}
              className={`tab whitespace-nowrap flex-shrink-0 ${
                activeTab === index ? "tab-active" : "tab-inactive"
              }`}
              role="tab"
              aria-selected={activeTab === index}
              aria-controls={`tabpanel-${tab.id}`}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

// Export tab IDs for external use
export const TAB_IDS = tabs.map((tab) => tab.id);
export type TabId = (typeof TAB_IDS)[number];
