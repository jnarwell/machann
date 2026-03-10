"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { SolMember } from "@/data/sol";

interface MemberListProps {
  members: SolMember[];
}

export default function MemberList({ members }: MemberListProps) {
  const { t } = useLanguage();

  const getStatusBadge = (status: SolMember["status"]) => {
    switch (status) {
      case "paid":
        return {
          text: t("kominote.status.paid"),
          className: "badge-sage",
          icon: "\u2713", // checkmark
        };
      case "recipient":
        return {
          text: t("kominote.status.recipient"),
          className: "badge-amber",
          icon: "\u2605", // star
        };
      case "upcoming":
        return {
          text: t("kominote.status.upcoming"),
          className: "bg-indigo-300/20 text-indigo-200",
          icon: null,
        };
      case "late":
        return {
          text: t("kominote.status.late"),
          className: "badge-red",
          icon: "\u26A0", // warning
        };
      default:
        return {
          text: "",
          className: "",
          icon: null,
        };
    }
  };

  return (
    <div className="card p-4">
      <h3 className="font-display text-lg font-semibold text-indigo mb-4">
        {t("kominote.members")}
      </h3>
      <div className="space-y-3">
        {members.map((member) => {
          const badge = getStatusBadge(member.status);
          return (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-lg bg-parchment-dark/30 hover:bg-parchment-dark/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-parchment font-display font-bold text-sm"
                  style={{ backgroundColor: member.avatarColor }}
                >
                  {member.initials}
                </div>

                {/* Name and location */}
                <div>
                  <p className="font-display font-semibold text-indigo">
                    {member.name}
                  </p>
                  <p className="text-xs text-indigo/60">{member.location}</p>
                </div>
              </div>

              {/* Status and amount */}
              <div className="flex items-center gap-3">
                <span className={`badge ${badge.className}`}>
                  {badge.icon && <span className="mr-1">{badge.icon}</span>}
                  {badge.text}
                </span>
                {member.status !== "late" && (
                  <span className="text-sm font-mono text-sage-600">
                    HTG {member.paidAmount.toLocaleString()}
                  </span>
                )}
                {member.status === "late" && (
                  <span className="text-sm font-mono text-alert-red">
                    HTG 0
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
