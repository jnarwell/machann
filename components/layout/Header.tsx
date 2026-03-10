"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";
import LanguageToggle from "./LanguageToggle";
import SettingsPanel from "@/components/settings/SettingsPanel";

// Simple bird SVG icon for the brand mark
function BirdIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-5 h-5 text-parchment"
      aria-hidden="true"
    >
      <path d="M21.8 13.4c-.1-.1-.2-.2-.4-.2-1.2-.3-2.4-.5-3.6-.5h-.5c.2-.6.3-1.3.3-2 0-3.9-3.1-7-7-7-1.9 0-3.7.8-5 2.1C4.3 7.1 3.5 9 3.5 11c0 .7.1 1.4.3 2H3c-1.2 0-2.4.2-3.6.5-.2 0-.3.1-.4.2-.1.1-.1.3 0 .4.1.1.2.2.4.2 1.6.4 3.2.6 4.9.7.2 2.1 1 4.1 2.3 5.6.1.1.3.2.5.2s.4-.1.5-.2c.3-.3.3-.7 0-1-.9-1-1.5-2.3-1.8-3.7.6.1 1.2.1 1.8.1h8c.6 0 1.2 0 1.8-.1-.3 1.4-.9 2.7-1.8 3.7-.3.3-.3.7 0 1 .1.1.3.2.5.2s.4-.1.5-.2c1.3-1.5 2.1-3.5 2.3-5.6 1.7-.1 3.3-.3 4.9-.7.2 0 .3-.1.4-.2.1-.1.1-.3 0-.4z" />
    </svg>
  );
}

// User avatar with initials
function UserAvatar({ initials, color, onClick }: { initials: string; color?: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 rounded-full flex items-center justify-center text-parchment text-xs font-body font-semibold hover:ring-2 hover:ring-parchment/50 transition-all cursor-pointer"
      style={{ backgroundColor: color || "#C1440E" }}
      title="Open settings"
    >
      {initials}
    </button>
  );
}

export default function Header() {
  const { t } = useLanguage();
  const { currentUser, isLoading } = useUser();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Fallback while loading
  const displayUser = currentUser || {
    name: "...",
    location: "",
    initials: "...",
    avatarColor: "#6B7C5E",
  };

  return (
    <>
      <header className="bg-indigo text-parchment px-4 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            {/* Brand mark - terracotta circle with bird */}
            <div className="w-10 h-10 rounded-full bg-terracotta flex items-center justify-center flex-shrink-0">
              <BirdIcon />
            </div>

            {/* Brand text */}
            <div className="flex flex-col">
              <span className="font-display text-lg leading-tight">
                {t("brand.name")}
              </span>
              <span className="font-body text-xs text-parchment/70 leading-tight">
                {t("brand.tagline")}
              </span>
            </div>
          </div>

          {/* Right: Language toggle + User chip */}
          <div className="flex items-center gap-4">
            <LanguageToggle />

            {/* User chip - clickable to open settings */}
            <div className="flex items-center gap-2">
              <UserAvatar
                initials={displayUser.initials}
                color={displayUser.avatarColor}
                onClick={() => setIsSettingsOpen(true)}
              />
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="hidden sm:flex flex-col text-right hover:opacity-80 transition-opacity"
              >
                <span className="font-body text-sm leading-tight">
                  {isLoading ? "..." : displayUser.name}
                </span>
                <span className="font-body text-xs text-parchment/70 leading-tight">
                  {displayUser.location || ""}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
