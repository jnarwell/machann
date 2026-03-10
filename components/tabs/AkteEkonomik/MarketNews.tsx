"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { newsItems, NewsItem } from "@/data/macro";

// Category badge configuration
const categoryConfig: Record<
  NewsItem["category"],
  { labelKR: string; labelEN: string; className: string }
> = {
  security: {
    labelKR: "Sekirite",
    labelEN: "Security",
    className: "bg-indigo-100 text-indigo-600",
  },
  trade: {
    labelKR: "Komès",
    labelEN: "Trade",
    className: "bg-amber-100 text-amber-600",
  },
  policy: {
    labelKR: "Politik",
    labelEN: "Policy",
    className: "bg-sage-100 text-sage-600",
  },
  market: {
    labelKR: "Mache",
    labelEN: "Market",
    className: "bg-terracotta-100 text-terracotta-600",
  },
  organization: {
    labelKR: "Oganizasyon",
    labelEN: "Organization",
    className: "bg-parchment-dark text-indigo-500",
  },
};

// Impact indicator configuration
const impactConfig: Record<
  NewsItem["impact"],
  { icon: JSX.Element; className: string }
> = {
  positive: {
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
          clipRule="evenodd"
        />
      </svg>
    ),
    className: "text-sage-500 bg-sage-50",
  },
  negative: {
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z"
          clipRule="evenodd"
        />
      </svg>
    ),
    className: "text-alert-red bg-red-50",
  },
  neutral: {
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z"
          clipRule="evenodd"
        />
      </svg>
    ),
    className: "text-amber-500 bg-amber-50",
  },
};

export default function MarketNews() {
  const { language, t } = useLanguage();

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "kr" ? "fr-HT" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <section className="bg-parchment rounded-lg p-4 md:p-6 shadow-sm border border-parchment-dark">
      {/* Header */}
      <h2 className="font-display text-xl md:text-2xl text-indigo-500 mb-4">
        {t("akteEkonomik.news.title")}
      </h2>

      {/* News Feed */}
      <div className="space-y-3">
        {newsItems.map((item) => {
          const title = language === "kr" ? item.titleKR : item.titleEN;
          const category = categoryConfig[item.category];
          const impact = impactConfig[item.impact];

          return (
            <article
              key={item.id}
              className="bg-white rounded-lg p-4 border border-parchment-dark hover:border-indigo-200 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Impact Indicator */}
                <div
                  className={`flex-shrink-0 p-1.5 rounded-full ${impact.className}`}
                >
                  {impact.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    {/* Category Badge */}
                    <span
                      className={`px-2 py-0.5 text-xs font-mono rounded ${category.className}`}
                    >
                      {language === "kr" ? category.labelKR : category.labelEN}
                    </span>
                    {/* Date */}
                    <span className="text-xs text-indigo-300 font-mono">
                      {formatDate(item.date)}
                    </span>
                  </div>

                  {/* Title */}
                  <p className="text-sm font-body text-indigo-500 leading-relaxed">
                    {title}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
