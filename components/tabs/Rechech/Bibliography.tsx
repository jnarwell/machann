"use client";

import { useLanguage } from "@/contexts/LanguageContext";

type Citation = {
  text: string;
  isFilm?: boolean;
};

const bibliographyContent = {
  kr: {
    courseTitle: "Materyèl Kou (3 obligatwa)",
    externalTitle: "Sous Akademik Ekstèn",
    dataTitle: "Sous Done",
    courseMaterials: [
      {
        text: 'Dupain, Etant, direktè. <em>Madan Sara</em>. Fim dokimantè, 2019.',
        isFilm: true,
      },
      {
        text: 'Hossein, Caroline Shenaz. "Black Women in the Marketplace: Cross-Border Traders and the Informal Economy." <em>Work Organisation, Labour & Globalisation</em> 9, no. 2 (2015): 36-50.',
      },
      {
        text: 'Schwartz, Timothy. "The Haitian Market System: An Overview of the Madan Sara." <em>Schwartz Research Group</em>, 2024.',
      },
    ],
    externalSources: [
      {
        text: 'Fafchamps, Marcel, ak Bart Minten. "Impact of SMS-Based Agricultural Information on Indian Farmers." <em>World Bank Economic Review</em> 26, no. 3 (2012): 383-414.',
      },
      {
        text: 'Wiseman, Eleanor. "Border Trade and Information Frictions: Evidence from the Sauti Platform in East Africa." Papye travay, Janvye 2023.',
      },
      {
        text: 'Courois, Pierre, ak Julie Subervie. "Farmer Bargaining Power and Market Information Services." <em>American Journal of Agricultural Economics</em> 97, no. 3 (2015): 953-977.',
      },
      {
        text: `Lacombe, et al. "Une économie informelle méta-institutionnalisée en Haïti: le rôle des madan sara." <em>Interventions Économiques</em> (2025).`,
      },
      {
        text: 'Andrée, B.P.J. "Haiti: Monthly Food Price Estimates by Market and Product." <em>World Bank Microdata Catalog</em>, Ref. HTI_2021_RTFP_v01_M (2021).',
      },
      {
        text: 'FAO/G20. "Price Volatility in Food and Agricultural Markets: Policy Responses." Rapò politik, 2011.',
      },
    ],
    dataSources: [
      { name: "World Bank Real-Time Food Prices (Haiti)", url: "https://microdata.worldbank.org/index.php/catalog/4494" },
      { name: "FAO GIEWS Food Price Monitoring", url: "https://fpma.fao.org/giews/fpmat4" },
      { name: "BRH (Banque de la République d'Haïti)", url: "https://www.brh.ht" },
      { name: "CNSA (Coordination Nationale de la Sécurité Alimentaire)", url: "https://www.cnsahaiti.org" },
    ],
  },
  en: {
    courseTitle: "Course Materials (3 required)",
    externalTitle: "External Scholarly Sources",
    dataTitle: "Data Sources",
    courseMaterials: [
      {
        text: 'Dupain, Etant, dir. <em>Madan Sara</em>. Documentary film, 2019.',
        isFilm: true,
      },
      {
        text: 'Hossein, Caroline Shenaz. "Black Women in the Marketplace: Cross-Border Traders and the Informal Economy." <em>Work Organisation, Labour & Globalisation</em> 9, no. 2 (2015): 36-50.',
      },
      {
        text: 'Schwartz, Timothy. "The Haitian Market System: An Overview of the Madan Sara." <em>Schwartz Research Group</em>, 2024.',
      },
    ],
    externalSources: [
      {
        text: 'Fafchamps, Marcel, and Bart Minten. "Impact of SMS-Based Agricultural Information on Indian Farmers." <em>World Bank Economic Review</em> 26, no. 3 (2012): 383-414.',
      },
      {
        text: 'Wiseman, Eleanor. "Border Trade and Information Frictions: Evidence from the Sauti Platform in East Africa." Working paper, January 2023.',
      },
      {
        text: 'Courois, Pierre, and Julie Subervie. "Farmer Bargaining Power and Market Information Services." <em>American Journal of Agricultural Economics</em> 97, no. 3 (2015): 953-977.',
      },
      {
        text: `Lacombe, et al. "Une économie informelle méta-institutionnalisée en Haïti: le rôle des madan sara." <em>Interventions Économiques</em> (2025).`,
      },
      {
        text: 'Andrée, B.P.J. "Haiti: Monthly Food Price Estimates by Market and Product." <em>World Bank Microdata Catalog</em>, Ref. HTI_2021_RTFP_v01_M (2021).',
      },
      {
        text: 'FAO/G20. "Price Volatility in Food and Agricultural Markets: Policy Responses." Policy report, 2011.',
      },
    ],
    dataSources: [
      { name: "World Bank Real-Time Food Prices (Haiti)", url: "https://microdata.worldbank.org/index.php/catalog/4494" },
      { name: "FAO GIEWS Food Price Monitoring", url: "https://fpma.fao.org/giews/fpmat4" },
      { name: "BRH (Banque de la République d'Haïti)", url: "https://www.brh.ht" },
      { name: "CNSA (Coordination Nationale de la Sécurité Alimentaire)", url: "https://www.cnsahaiti.org" },
    ],
  },
};

function CitationItem({ citation }: { citation: Citation }) {
  return (
    <li
      className="font-body text-indigo/80 leading-relaxed pl-8 -indent-8"
      dangerouslySetInnerHTML={{ __html: citation.text }}
    />
  );
}

export default function Bibliography() {
  const { language, t } = useLanguage();
  const content = bibliographyContent[language];

  return (
    <section className="mb-16">
      {/* Section Header */}
      <h2 className="font-display text-2xl md:text-3xl text-indigo mb-8">
        {t("rechech.bibliography.title")}
      </h2>

      {/* Course Materials */}
      <div className="mb-10">
        <h3 className="font-display text-xl text-terracotta mb-4 flex items-center gap-2">
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
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          {content.courseTitle}
        </h3>
        <ul className="space-y-4 bg-parchment-light rounded-lg border border-parchment-dark/30 p-6">
          {content.courseMaterials.map((citation, index) => (
            <CitationItem key={index} citation={citation} />
          ))}
        </ul>
      </div>

      {/* External Scholarly Sources */}
      <div className="mb-10">
        <h3 className="font-display text-xl text-terracotta mb-4 flex items-center gap-2">
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
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
          {content.externalTitle}
        </h3>
        <ul className="space-y-4 bg-parchment-light rounded-lg border border-parchment-dark/30 p-6">
          {content.externalSources.map((citation, index) => (
            <CitationItem key={index} citation={citation} />
          ))}
        </ul>
      </div>

      {/* Data Sources */}
      <div>
        <h3 className="font-display text-xl text-terracotta mb-4 flex items-center gap-2">
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
              d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
            />
          </svg>
          {content.dataTitle}
        </h3>
        <ul className="space-y-3 bg-parchment-light rounded-lg border border-parchment-dark/30 p-6">
          {content.dataSources.map((source, index) => (
            <li key={index} className="flex items-start gap-2">
              <svg
                className="w-4 h-4 text-sage mt-1 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-indigo/80 hover:text-terracotta transition-colors underline underline-offset-2"
              >
                {source.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
