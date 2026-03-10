"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const artifactContent = {
  kr: {
    title: "Artefak Prensipal",
    artifactName: "World Bank Real-Time Food Price Dataset pou Ayiti",
    dateRange: "(2021-prezan)",
    linkLabel: "Gade done yo",
    whyTitle: "Poukisa artefak sa a",
    whyContent: `Sa a se done ki ta dwe nan men madan sara men ki pa la — asimetri a vizib nan kiyès ki gen aksè. Machann fòmèl, ONG, ak analis bank gen aksè a enfòmasyon pri detaye pa rejyon ak pwodwi. Madan sara, ki pote ekonomi mache a sou do yo, ap negosye avèg.`,
    analysisNote: {
      title: "Nòt Analiz",
      content: `Diferans pri ant depatman reprezante plis pase jis transpò. Li revele ki zòn gen aksè a enfòmasyon, ki machann ka eksplwate diferans yo, ak ki kominote peye pi plis poutèt izolasyon. Diferans 15-25% ant pri Pòtoprens ak pri Nò/Sid se taks asimetri.`,
    },
  },
  en: {
    title: "Primary Artifact",
    artifactName: "World Bank Real-Time Food Price Dataset for Haiti",
    dateRange: "(2021-present)",
    linkLabel: "View the dataset",
    whyTitle: "Why this artifact",
    whyContent: `This is the data that should be in madan sara hands but isn't — the asymmetry is visible in who accesses it. Formal traders, NGOs, and bank analysts have access to detailed price information by region and commodity. Madan sara, who carry the market economy on their backs, negotiate blind.`,
    analysisNote: {
      title: "Analysis Note",
      content: `The price spread between departments represents more than just transport costs. It reveals which zones have information access, which traders can exploit differentials, and which communities pay more due to isolation. A 15-25% spread between Port-au-Prince and North/South prices is an asymmetry tax.`,
    },
  },
};

export default function PrimaryArtifact() {
  const { language, t } = useLanguage();
  const content = artifactContent[language];

  return (
    <section className="mb-16">
      {/* Section Header */}
      <h2 className="font-display text-2xl md:text-3xl text-indigo mb-6">
        {t("rechech.artifact.title")}
      </h2>

      {/* Artifact Card */}
      <div className="bg-parchment-light border border-parchment-dark/30 rounded-lg overflow-hidden mb-8">
        {/* Header */}
        <div className="bg-indigo px-6 py-4">
          <h3 className="font-display text-xl text-parchment">
            {content.artifactName}
          </h3>
          <p className="font-body text-parchment/70 text-sm">
            {content.dateRange}
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Link */}
          <a
            href="https://microdata.worldbank.org/index.php/catalog/4494"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-terracotta hover:text-terracotta-600 font-body transition-colors mb-6"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <span className="underline underline-offset-2">
              microdata.worldbank.org/index.php/catalog/4494
            </span>
            <span className="text-indigo/50 text-sm">({content.linkLabel})</span>
          </a>

          {/* Why this artifact */}
          <div className="mb-6">
            <h4 className="font-display text-lg text-indigo mb-3">
              {content.whyTitle}
            </h4>
            <p className="font-body text-indigo/80 leading-relaxed">
              {content.whyContent}
            </p>
          </div>

          {/* Analysis Note */}
          <div className="bg-amber/10 border-l-4 border-amber rounded-r-lg p-4">
            <h5 className="font-display text-base text-amber-600 mb-2">
              {content.analysisNote.title}
            </h5>
            <p className="font-body text-sm text-indigo/80 leading-relaxed">
              {content.analysisNote.content}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
