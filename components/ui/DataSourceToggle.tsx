"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export type DataSource = "official" | "user" | "blended";

interface DataSourceToggleProps {
  value: DataSource;
  onChange: (source: DataSource) => void;
  showBlended?: boolean;
  compact?: boolean;
}

export default function DataSourceToggle({
  value,
  onChange,
  showBlended = true,
  compact = false,
}: DataSourceToggleProps) {
  const { language } = useLanguage();

  const sources: { id: DataSource; labelKr: string; labelEn: string; icon: string; description?: string }[] = [
    {
      id: "official",
      labelKr: "Ofisyèl",
      labelEn: "Official",
      icon: "\u25A0", // ■ solid square
      description: language === "kr" ? "Done FEWS NET" : "FEWS NET data",
    },
    {
      id: "user",
      labelKr: "Machann",
      labelEn: "Traders",
      icon: "\u25CF\u25CF", // ●● double circles
      description: language === "kr" ? "Done machann yo" : "Trader-reported",
    },
    ...(showBlended
      ? [
          {
            id: "blended" as DataSource,
            labelKr: "Konbine",
            labelEn: "Blended",
            icon: "\u21C4", // ⇄ left right arrows
            description: language === "kr" ? "Tout sous" : "All sources",
          },
        ]
      : []),
  ];

  if (compact) {
    return (
      <div className="inline-flex rounded-lg bg-parchment-dark/30 p-1">
        {sources.map((source) => (
          <button
            key={source.id}
            onClick={() => onChange(source.id)}
            className={`
              px-3 py-1.5 text-sm rounded-md transition-all
              ${
                value === source.id
                  ? "bg-indigo text-parchment shadow-sm"
                  : "text-indigo/70 hover:text-indigo hover:bg-parchment-dark/30"
              }
            `}
            title={source.description}
          >
            <span className="mr-1">{source.icon}</span>
            {language === "kr" ? source.labelKr : source.labelEn}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-parchment border border-sage/30 rounded-xl p-3">
      <p className="text-xs text-indigo/60 mb-2 font-medium">
        {language === "kr" ? "Sous done" : "Data source"}
      </p>
      <div className="flex flex-wrap gap-2">
        {sources.map((source) => (
          <button
            key={source.id}
            onClick={() => onChange(source.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all
              ${
                value === source.id
                  ? "border-sage bg-sage/10 text-indigo shadow-sm"
                  : "border-transparent bg-parchment-dark/20 text-indigo/70 hover:border-sage/50"
              }
            `}
          >
            <span className="text-lg">{source.icon}</span>
            <div className="text-left">
              <p className="font-medium text-sm">
                {language === "kr" ? source.labelKr : source.labelEn}
              </p>
              {source.description && (
                <p className="text-xs text-indigo/50">{source.description}</p>
              )}
            </div>
            {value === source.id && (
              <span className="ml-1 text-sage">{"\u2713"}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
