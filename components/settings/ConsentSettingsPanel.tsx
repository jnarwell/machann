"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ConsentSettings {
  shareWithGroup: boolean;
  shareWithRegion: boolean;
  shareWithNetwork: boolean;
  anonymizeData: boolean;
  shareMargin: boolean;
  shareRoutes: boolean;
}

interface ConsentSettingsPanelProps {
  onClose?: () => void;
  onSave?: (settings: ConsentSettings) => void;
}

export default function ConsentSettingsPanel({
  onClose,
  onSave,
}: ConsentSettingsPanelProps) {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [settings, setSettings] = useState<ConsentSettings>({
    shareWithGroup: false,
    shareWithRegion: false,
    shareWithNetwork: false,
    anonymizeData: true,
    shareMargin: false,
    shareRoutes: false,
  });

  // Fetch current consent settings
  useEffect(() => {
    const fetchConsent = async () => {
      try {
        const response = await fetch("/api/consent");
        if (response.ok) {
          const data = await response.json();
          setSettings({
            shareWithGroup: data.shareWithGroup ?? false,
            shareWithRegion: data.shareWithRegion ?? false,
            shareWithNetwork: data.shareWithNetwork ?? false,
            anonymizeData: data.anonymizeData ?? true,
            shareMargin: data.shareMargin ?? false,
            shareRoutes: data.shareRoutes ?? false,
          });
        }
      } catch (err) {
        console.error("Failed to fetch consent settings:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConsent();
  }, []);

  const handleToggle = (key: keyof ConsentSettings) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: !prev[key] };

      // Enforce tier hierarchy: higher tiers require lower tiers
      if (key === "shareWithRegion" && !prev.shareWithRegion) {
        newSettings.shareWithGroup = true;
      }
      if (key === "shareWithNetwork" && !prev.shareWithNetwork) {
        newSettings.shareWithGroup = true;
        newSettings.shareWithRegion = true;
      }

      // Disabling lower tiers disables higher tiers
      if (key === "shareWithGroup" && prev.shareWithGroup) {
        newSettings.shareWithRegion = false;
        newSettings.shareWithNetwork = false;
      }
      if (key === "shareWithRegion" && prev.shareWithRegion) {
        newSettings.shareWithNetwork = false;
      }

      return newSettings;
    });
    setError(null);
    setSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/consent", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save settings");
      }

      setSuccess(true);
      onSave?.(settings);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const tiers = [
    {
      key: "shareWithGroup" as const,
      icon: "\u25CF\u25CF", // ●● double circles (group)
      titleKr: "Pataje ak Gwoup Sòl Ou",
      titleEn: "Share with Your Sòl Group",
      descKr: "Manm gwoup ou a ap wè pri ou rapòte yo",
      descEn: "Your group members will see prices you report",
      level: 1,
    },
    {
      key: "shareWithRegion" as const,
      icon: "\u25A1", // □ square (region)
      titleKr: "Pataje ak Rejyon An",
      titleEn: "Share with Region",
      descKr: "Pri yo ap antre nan siyal rejyonal (anonim)",
      descEn: "Prices contribute to regional signals (anonymous)",
      level: 2,
    },
    {
      key: "shareWithNetwork" as const,
      icon: "\u25C7", // ◇ diamond (network)
      titleKr: "Pataje ak Rezo Nasyonal",
      titleEn: "Share with National Network",
      descKr: "Ede tout machann Ayiti konnen pri yo",
      descEn: "Help all Haitian traders know prices",
      level: 3,
    },
  ];

  const privacyOptions = [
    {
      key: "anonymizeData" as const,
      icon: "\u2638", // ✸ (anonymous/hidden)
      titleKr: "Anonimize Done Mwen",
      titleEn: "Anonymize My Data",
      descKr: "Non ou pa parèt nan rapò yo",
      descEn: "Your name doesn't appear in reports",
    },
    {
      key: "shareMargin" as const,
      icon: "\u25B2", // ▲ (profit/up)
      titleKr: "Pataje Benefis",
      titleEn: "Share Profit Margins",
      descKr: "Ede kalkile mwayèn benefis rejyonal",
      descEn: "Help calculate regional profit averages",
    },
    {
      key: "shareRoutes" as const,
      icon: "\u2192", // → (route/arrow)
      titleKr: "Pataje Wout Komès",
      titleEn: "Share Trade Routes",
      descKr: "Kontribye nan done transpò ak wout",
      descEn: "Contribute transport and route data",
    },
  ];

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-indigo/10 rounded w-1/3"></div>
          <div className="h-20 bg-indigo/10 rounded"></div>
          <div className="h-20 bg-indigo/10 rounded"></div>
          <div className="h-20 bg-indigo/10 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-semibold text-indigo flex items-center gap-2">
            <span className="text-sage">{"\u2630"}</span>
            {language === "kr" ? "Paramèt Pataj Done" : "Data Sharing Settings"}
          </h2>
          <p className="text-sm text-indigo/60 mt-1">
            {language === "kr"
              ? "Kontwole kijan done ou pataje"
              : "Control how your data is shared"}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-indigo/40 hover:text-indigo transition-colors"
          >
            {"\u2715"}
          </button>
        )}
      </div>

      {/* Tier Explanation */}
      <div className="bg-sage/10 border border-sage/30 rounded-lg p-4 mb-6">
        <p className="text-sm text-indigo/80">
          <span className="font-semibold">
            {language === "kr" ? "Kijan sa fonksyone:" : "How it works:"}
          </span>{" "}
          {language === "kr"
            ? "Done ou pataje anonim epi konbine ak lòt machann pou kreye siyal pri ki itil pou tout moun."
            : "Your shared data is anonymized and combined with other traders to create price signals useful for everyone."}
        </p>
      </div>

      {/* Sharing Tiers */}
      <div className="space-y-3 mb-6">
        <h3 className="text-sm font-medium text-indigo/70">
          {language === "kr" ? "Nivo Pataj" : "Sharing Tiers"}
        </h3>
        {tiers.map((tier) => (
          <div
            key={tier.key}
            className={`
              border rounded-lg p-4 transition-all
              ${settings[tier.key]
                ? "border-sage bg-sage/5"
                : "border-indigo/10 bg-parchment-dark/20"
              }
            `}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{tier.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-indigo">
                      {language === "kr" ? tier.titleKr : tier.titleEn}
                    </h4>
                    <p className="text-xs text-indigo/60 mt-0.5">
                      {language === "kr" ? tier.descKr : tier.descEn}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle(tier.key)}
                    className={`
                      relative w-12 h-6 rounded-full transition-colors
                      ${settings[tier.key] ? "bg-sage" : "bg-indigo/20"}
                    `}
                    aria-pressed={settings[tier.key]}
                    aria-label={language === "kr" ? tier.titleKr : tier.titleEn}
                  >
                    <span
                      className={`
                        absolute top-1 w-4 h-4 bg-parchment rounded-full shadow transition-transform
                        ${settings[tier.key] ? "translate-x-7" : "translate-x-1"}
                      `}
                    />
                  </button>
                </div>
                {tier.level > 1 && !settings.shareWithGroup && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <span>{"\u26A0"}</span>
                    {language === "kr"
                      ? "Bezwen pataje ak gwoup dabò"
                      : "Requires group sharing first"}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Privacy Options */}
      <div className="space-y-3 mb-6">
        <h3 className="text-sm font-medium text-indigo/70">
          {language === "kr" ? "Opsyon Prive" : "Privacy Options"}
        </h3>
        {privacyOptions.map((option) => (
          <div
            key={option.key}
            className="flex items-center justify-between py-3 border-b border-indigo/10 last:border-0"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{option.icon}</span>
              <div>
                <h4 className="text-sm font-medium text-indigo">
                  {language === "kr" ? option.titleKr : option.titleEn}
                </h4>
                <p className="text-xs text-indigo/50">
                  {language === "kr" ? option.descKr : option.descEn}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleToggle(option.key)}
              className={`
                relative w-10 h-5 rounded-full transition-colors
                ${settings[option.key] ? "bg-sage" : "bg-indigo/20"}
              `}
              aria-pressed={settings[option.key]}
              aria-label={language === "kr" ? option.titleKr : option.titleEn}
            >
              <span
                className={`
                  absolute top-0.5 w-4 h-4 bg-parchment rounded-full shadow transition-transform
                  ${settings[option.key] ? "translate-x-5" : "translate-x-0.5"}
                `}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-3 bg-alert-red/10 border border-alert-red/30 rounded-lg text-alert-red text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-alert-green/10 border border-alert-green/30 rounded-lg text-alert-green text-sm flex items-center gap-2">
          <span>{"\u2713"}</span>
          {language === "kr" ? "Paramèt yo anrejistre!" : "Settings saved!"}
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full py-3 bg-sage text-parchment rounded-lg font-display font-medium hover:bg-sage-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSaving ? (
          <>
            <span className="animate-spin">{"\u21BB"}</span>
            {language === "kr" ? "Ap anrejistre..." : "Saving..."}
          </>
        ) : (
          <>
            <span>{"\u2713"}</span>
            {language === "kr" ? "Anrejistre Paramèt" : "Save Settings"}
          </>
        )}
      </button>

      {/* Privacy Notice */}
      <p className="text-xs text-indigo/40 mt-4 text-center">
        {language === "kr"
          ? "Ou ka chanje paramèt sa yo nenpòt lè. Done ou toujou rete anba kontwòl ou."
          : "You can change these settings anytime. Your data always remains under your control."}
      </p>
    </div>
  );
}
