"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface LoanProgram {
  nameKr: string;
  nameEn: string;
  loanAmountKr: string;
  loanAmountEn: string;
  rate: string;
  requirementKr: string;
  requirementEn: string;
  status: "eligible" | "notYet";
  notYetReasonKr?: string;
  notYetReasonEn?: string;
}

const loanPrograms: LoanProgram[] = [
  {
    nameKr: "Fonkoze Ti Kredi",
    nameEn: "Fonkoze Ti Kredi",
    loanAmountKr: "$75 USD (gwoup solidarite 5 moun)",
    loanAmountEn: "$75 USD (solidarity group of 5)",
    rate: "5%",
    requirementKr: "Gwoup solidarite + pwogram alfabetizasyon",
    requirementEn: "Solidarity group + literacy program",
    status: "eligible",
  },
  {
    nameKr: "Fonkoze Solidarite",
    nameEn: "Fonkoze Solidarite",
    loanAmountKr: "$75 - $500 (gwoup)",
    loanAmountEn: "$75 - $500 (group)",
    rate: "3.5%",
    requirementKr: "Ti Kredi konplete + gwoup aktif",
    requirementEn: "Ti Kredi completed + active group",
    status: "eligible",
  },
  {
    nameKr: "Fonkoze Biznis",
    nameEn: "Fonkoze Business",
    loanAmountKr: "$1,300+ (endividyèl, 12 mwa)",
    loanAmountEn: "$1,300+ (individual, 12-month)",
    rate: "2.5%",
    requirementKr: "Istwa komès solid + 2+ ane ak Fonkoze",
    requirementEn: "Solid trade history + 2+ years with Fonkoze",
    status: "notYet",
    notYetReasonKr: "bezwen plis istwa komès",
    notYetReasonEn: "more trade history needed",
  },
];

export default function LoanProgramCards() {
  const { language, t } = useLanguage();

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg text-indigo font-semibold">
        {t("finans.loanPrograms")}
      </h3>

      <div className="grid gap-4 md:grid-cols-3">
        {loanPrograms.map((program, index) => {
          const name = language === "kr" ? program.nameKr : program.nameEn;
          const loanAmount =
            language === "kr" ? program.loanAmountKr : program.loanAmountEn;
          const requirement =
            language === "kr" ? program.requirementKr : program.requirementEn;
          const notYetReason =
            language === "kr" ? program.notYetReasonKr : program.notYetReasonEn;

          return (
            <div
              key={index}
              className="card p-4 flex flex-col gap-3 relative overflow-hidden"
            >
              {/* Status badge */}
              <div className="absolute top-3 right-3">
                {program.status === "eligible" ? (
                  <span className="badge badge-green">
                    {t("finans.status.eligible")}
                  </span>
                ) : (
                  <span className="badge badge-amber">
                    {t("finans.status.notYet")}
                  </span>
                )}
              </div>

              {/* Program name */}
              <h4 className="font-display text-base font-semibold text-terracotta pr-16">
                {name}
              </h4>

              {/* Loan details */}
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-indigo/60">{t("finans.startingLoan")}: </span>
                  <span className="font-mono text-indigo font-medium">
                    {loanAmount}
                  </span>
                </div>

                <div>
                  <span className="text-indigo/60">{t("finans.rate")}: </span>
                  <span className="font-mono text-indigo font-medium">
                    {program.rate} {t("finans.monthly")}
                  </span>
                </div>

                <div>
                  <span className="text-indigo/60">{t("finans.requirement")}: </span>
                  <span className="text-indigo">{requirement}</span>
                </div>
              </div>

              {/* Not yet reason if applicable */}
              {program.status === "notYet" && notYetReason && (
                <p className="text-xs text-amber-700 italic mt-auto pt-2 border-t border-parchment-dark/20">
                  {notYetReason}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
