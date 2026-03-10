"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const researchQuestionContent = {
  kr: {
    question: `Kijan asimetri enfòmasyon nan mache pwodwi Ayisyen dezavantaje madan sara estriktirèlman parapò a aktè sektè fòmèl ant 2018-2026, epi èske yon platfòm transparans pri bileng ak aksè lib — ki ankre nan enfrastrikti finansyè endijèn ki deja egziste (sistèm pratik / sòl) — ka redui diferans sa a de fason mezurab?`,
    smartBreakdown: {
      specific: {
        label: "Espesifik",
        content: "Madan sara nan mache pwodwi Ayisyen, 2018-2026",
      },
      measurable: {
        label: "Mezurab",
        content:
          "Varyans diferans pri atravè mache rejyonal; to aksè prè; sikl sòl konplete",
      },
      achievable: {
        label: "Reyalizab",
        content:
          "Platfòm konstwi sou enfrastrikti MonCash ki deja egziste + rezo RAMSA",
      },
      realistic: {
        label: "Reyalis",
        content: "Presedans pwouve nan Kenya, Ghana, Uganda",
      },
      timeBound: {
        label: "Delè",
        content:
          "Pilòt L1 nan 3 depatman anvan Desanm 2026; deplwaman nasyonal konplè anvan 2028",
      },
    },
  },
  en: {
    question: `How does information asymmetry in Haitian commodity markets structurally disadvantage madan sara relative to formal-sector actors between 2018-2026, and can a bilingual open-access price transparency platform — anchored in existing indigenous financial infrastructure (sistèm pratik / sòl) — measurably reduce that gap?`,
    smartBreakdown: {
      specific: {
        label: "Specific",
        content: "Madan sara in Haitian commodity markets, 2018-2026",
      },
      measurable: {
        label: "Measurable",
        content:
          "Price spread variance across regional markets; loan access rates; sòl cycle completion",
      },
      achievable: {
        label: "Achievable",
        content:
          "Platform built on existing MonCash infrastructure + RAMSA network",
      },
      realistic: {
        label: "Realistic",
        content: "Precedent proven in Kenya, Ghana, Uganda",
      },
      timeBound: {
        label: "Time-bound",
        content:
          "L1 pilot in 3 departments by December 2026; full national deployment by 2028",
      },
    },
  },
};

export default function ResearchQuestion() {
  const { language, t } = useLanguage();
  const content = researchQuestionContent[language];

  return (
    <section className="mb-16">
      {/* Section Header */}
      <h2 className="font-display text-2xl md:text-3xl text-indigo mb-6">
        {t("rechech.question.title")}
      </h2>

      {/* Research Question Blockquote */}
      <blockquote className="relative bg-parchment-light border-l-4 border-terracotta p-6 md:p-8 rounded-r-lg mb-8">
        <div className="absolute top-4 left-4 text-terracotta/20 text-6xl font-display leading-none select-none">
          &ldquo;
        </div>
        <p className="font-body text-lg md:text-xl text-indigo leading-relaxed italic pl-8">
          {content.question}
        </p>
        <div className="absolute bottom-4 right-6 text-terracotta/20 text-6xl font-display leading-none select-none">
          &rdquo;
        </div>
      </blockquote>

      {/* SMART Breakdown */}
      <div className="bg-indigo/5 rounded-lg p-6 md:p-8">
        <h3 className="font-display text-xl text-indigo mb-6">
          {t("rechech.smart.title")}
        </h3>

        <div className="grid gap-4 md:gap-6">
          {Object.entries(content.smartBreakdown).map(([key, item]) => (
            <div
              key={key}
              className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4"
            >
              <span className="inline-flex items-center justify-center min-w-[140px] px-3 py-1.5 bg-terracotta text-parchment font-display text-sm rounded-full">
                {item.label}
              </span>
              <p className="font-body text-indigo/90 leading-relaxed">
                {item.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
