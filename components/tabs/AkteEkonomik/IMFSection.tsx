"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { imfData } from "@/data/macro";

export default function IMFSection() {
  const { language, t } = useLanguage();

  const programStatus =
    language === "kr" ? imfData.programStatus : imfData.programStatusEN;
  const condition =
    language === "kr" ? imfData.conditionKR : imfData.conditionEN;
  const alert = language === "kr" ? imfData.alertKR : imfData.alertEN;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "kr" ? "fr-HT" : "en-US", {
      year: "numeric",
      month: "long",
    });
  };

  return (
    <section className="bg-parchment rounded-lg p-4 md:p-6 shadow-sm border border-parchment-dark">
      {/* Header */}
      <h2 className="font-display text-xl md:text-2xl text-indigo-500 mb-4">
        {t("akteEkonomik.imf.title")}
      </h2>

      {/* Alert Banner */}
      <div className="bg-amber-100 border-l-4 border-amber-500 rounded-r-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-amber-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-body text-amber-800 font-medium">
              {alert}
            </p>
          </div>
        </div>
      </div>

      {/* Program Status */}
      <div className="bg-white rounded-lg p-4 border border-parchment-dark mb-4">
        <h3 className="text-sm font-display text-indigo-400 mb-2">
          {t("akteEkonomik.imf.status")}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-lg font-body text-indigo-500">{programStatus}</p>
          <span className="px-2 py-1 bg-sage-100 text-sage-600 text-xs font-mono rounded">
            {formatDate(imfData.lastConsultation)}
          </span>
        </div>
      </div>

      {/* Plain-Language Explainer */}
      <div className="bg-sage-50 rounded-lg p-4 border border-sage-200">
        <h3 className="text-sm font-display text-sage-600 mb-2 flex items-center gap-2">
          <svg
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
              clipRule="evenodd"
            />
          </svg>
          {t("akteEkonomik.imf.impact")}
        </h3>
        <p className="text-sm font-body text-sage-700 leading-relaxed">
          {condition}
        </p>
      </div>
    </section>
  );
}
