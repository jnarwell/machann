"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { SolGroup } from "@/data/sol";

interface SolStatsProps {
  group: SolGroup;
}

export default function SolStats({ group }: SolStatsProps) {
  const { t } = useLanguage();

  const currentRecipient = group.members[group.currentRecipientIndex];

  const stats = [
    {
      labelKey: "kominote.totalPool" as const,
      value: `HTG ${group.poolPerCycle.toLocaleString()}`,
    },
    {
      labelKey: "kominote.contribution" as const,
      value: `HTG ${group.contributionPerMember.toLocaleString()}`,
    },
    {
      labelKey: "kominote.currentRecipient" as const,
      value: currentRecipient.name.split(" ")[0],
      highlight: true,
    },
    {
      labelKey: "kominote.nextCycle" as const,
      value: group.nextCycleDate,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 mt-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`p-3 rounded-lg ${
            stat.highlight
              ? "bg-amber/20 border border-amber/40"
              : "bg-white/5 border border-white/10"
          }`}
        >
          <p className="text-xs text-parchment/60 mb-1">{t(stat.labelKey)}</p>
          <p
            className={`text-sm font-display font-semibold ${
              stat.highlight ? "text-amber" : "text-parchment"
            }`}
          >
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
