"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export type SyncStatus = "online" | "offline" | "syncing" | "error" | "pending";

interface SyncStatusIndicatorProps {
  // For now these can be passed in; later they'll come from a sync context
  status?: SyncStatus;
  pendingCount?: number;
  lastSynced?: Date | null;
  onRetrySync?: () => void;
  onViewPending?: () => void;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  minimal?: boolean;
}

export default function SyncStatusIndicator({
  status: externalStatus,
  pendingCount: externalPendingCount,
  lastSynced: externalLastSynced,
  onRetrySync,
  onViewPending,
  position = "bottom-right",
  minimal = false,
}: SyncStatusIndicatorProps) {
  const { language } = useLanguage();
  const [isOnline, setIsOnline] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Use external values or derive from browser state
  const status = externalStatus ?? (isOnline ? "online" : "offline");
  const pendingCount = externalPendingCount ?? 0;
  const lastSynced = externalLastSynced ?? null;

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const getStatusConfig = () => {
    switch (status) {
      case "online":
        return {
          icon: "\u{2713}", // ✓
          color: "bg-alert-green",
          textColor: "text-alert-green",
          bgColor: "bg-alert-green/10",
          borderColor: "border-alert-green/30",
          labelKr: "Konekte",
          labelEn: "Online",
        };
      case "offline":
        return {
          icon: "\u{26A0}", // ⚠
          color: "bg-amber",
          textColor: "text-amber-600",
          bgColor: "bg-amber/10",
          borderColor: "border-amber/30",
          labelKr: "Òflenn",
          labelEn: "Offline",
        };
      case "syncing":
        return {
          icon: "\u{21BB}", // ↻
          color: "bg-indigo",
          textColor: "text-indigo",
          bgColor: "bg-indigo/10",
          borderColor: "border-indigo/30",
          labelKr: "Ap senkronize...",
          labelEn: "Syncing...",
          animate: true,
        };
      case "error":
        return {
          icon: "\u{2717}", // ✗
          color: "bg-alert-red",
          textColor: "text-alert-red",
          bgColor: "bg-alert-red/10",
          borderColor: "border-alert-red/30",
          labelKr: "Erè senkronizasyon",
          labelEn: "Sync Error",
        };
      case "pending":
        return {
          icon: "\u{23F1}", // ⏱
          color: "bg-sage",
          textColor: "text-sage-600",
          bgColor: "bg-sage/10",
          borderColor: "border-sage/30",
          labelKr: `${pendingCount} an atant`,
          labelEn: `${pendingCount} pending`,
        };
      default:
        return {
          icon: "\u{2022}", // •
          color: "bg-indigo/30",
          textColor: "text-indigo/50",
          bgColor: "bg-indigo/5",
          borderColor: "border-indigo/10",
          labelKr: "Enkoni",
          labelEn: "Unknown",
        };
    }
  };

  const config = getStatusConfig();

  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
  };

  const formatLastSynced = () => {
    if (!lastSynced) {
      return language === "kr" ? "Jamè senkronize" : "Never synced";
    }

    const now = new Date();
    const diffMs = now.getTime() - lastSynced.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) {
      return language === "kr" ? "Kounye a" : "Just now";
    } else if (diffMins < 60) {
      return language === "kr"
        ? `${diffMins} minit pase`
        : `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return language === "kr"
        ? `${diffHours} lè pase`
        : `${diffHours}h ago`;
    } else {
      return lastSynced.toLocaleDateString(
        language === "kr" ? "fr-HT" : "en-US",
        { month: "short", day: "numeric" }
      );
    }
  };

  // Minimal mode: just a small dot indicator
  if (minimal) {
    return (
      <div
        className={`fixed ${positionClasses[position]} z-50`}
        title={language === "kr" ? config.labelKr : config.labelEn}
      >
        <div
          className={`
            w-3 h-3 rounded-full ${config.color}
            ${config.animate ? "animate-pulse" : ""}
          `}
        />
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-amber text-parchment text-xs w-4 h-4 rounded-full flex items-center justify-center font-mono">
            {pendingCount > 9 ? "9+" : pendingCount}
          </span>
        )}
      </div>
    );
  }

  // Full indicator with expansion
  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <div
        className={`
          ${config.bgColor} ${config.borderColor} border rounded-lg shadow-lg
          transition-all duration-200 overflow-hidden
          ${isExpanded ? "w-64" : "w-auto"}
        `}
      >
        {/* Main indicator button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-3 py-2 w-full text-left"
        >
          <span
            className={`
              ${config.textColor} text-lg
              ${config.animate ? "animate-spin" : ""}
            `}
          >
            {config.icon}
          </span>
          <span className={`text-sm font-medium ${config.textColor}`}>
            {language === "kr" ? config.labelKr : config.labelEn}
          </span>
          {pendingCount > 0 && status !== "pending" && (
            <span className="ml-auto bg-amber/20 text-amber-600 text-xs px-2 py-0.5 rounded-full">
              {pendingCount}
            </span>
          )}
          <span
            className={`
              text-indigo/40 text-sm transition-transform
              ${isExpanded ? "rotate-180" : ""}
            `}
          >
            {"\u25B2"}
          </span>
        </button>

        {/* Expanded content */}
        {isExpanded && (
          <div className="px-3 pb-3 border-t border-indigo/10">
            {/* Last synced */}
            <p className="text-xs text-indigo/50 mt-2">
              {language === "kr" ? "Dènye senkronizasyon:" : "Last synced:"}{" "}
              <span className="font-medium">{formatLastSynced()}</span>
            </p>

            {/* Pending items summary */}
            {pendingCount > 0 && (
              <div className="mt-2 p-2 bg-parchment rounded text-xs">
                <p className="text-indigo/70">
                  {language === "kr"
                    ? `${pendingCount} eleman ap tann senkronizasyon`
                    : `${pendingCount} items waiting to sync`}
                </p>
                {onViewPending && (
                  <button
                    onClick={onViewPending}
                    className="mt-1 text-sage-600 hover:text-sage underline"
                  >
                    {language === "kr" ? "Gade detay" : "View details"}
                  </button>
                )}
              </div>
            )}

            {/* Offline mode info */}
            {status === "offline" && (
              <div className="mt-2 p-2 bg-amber/10 rounded text-xs text-amber-700">
                <p>
                  {language === "kr"
                    ? "Ou ka kontinye travay. Done yo ap senkronize lè ou retounen sou entènèt."
                    : "You can keep working. Data will sync when you're back online."}
                </p>
              </div>
            )}

            {/* Error with retry */}
            {status === "error" && onRetrySync && (
              <button
                onClick={onRetrySync}
                className="mt-2 w-full py-2 bg-sage/20 text-sage-600 rounded text-sm hover:bg-sage/30 transition-colors"
              >
                {language === "kr" ? "Eseye ankò" : "Retry Sync"}
              </button>
            )}

            {/* Connection indicator */}
            <div className="mt-2 pt-2 border-t border-indigo/10 flex items-center justify-between text-xs">
              <span className="text-indigo/50">
                {language === "kr" ? "Koneksyon" : "Connection"}
              </span>
              <span className="flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? "bg-alert-green" : "bg-alert-red"
                  }`}
                />
                <span className={isOnline ? "text-alert-green" : "text-alert-red"}>
                  {isOnline
                    ? language === "kr"
                      ? "Konekte"
                      : "Connected"
                    : language === "kr"
                    ? "Dekonekte"
                    : "Disconnected"}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
