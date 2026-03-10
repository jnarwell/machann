"use client";

import { useLanguage } from "@/contexts/LanguageContext";

type CaseStudy = {
  name: string;
  location: string;
  years: string;
  status: "success" | "partial" | "failure";
  tool: string;
  population: string;
  result: string;
  limitation?: string;
  keyLesson: string;
  source: string;
};

const caseStudiesContent = {
  kr: {
    successTitle: "Sa ki mache",
    failureTitle: "Sa ki echwe",
    toolLabel: "Zouti",
    populationLabel: "Popilasyon",
    resultLabel: "Rezilta",
    limitationLabel: "Limit",
    keyLessonLabel: "Leson kle",
    sourceLabel: "Sous",
    cases: {
      success: [
        {
          name: "Sauti East Africa",
          location: "Kenya/Uganda",
          years: "2021",
          status: "success" as const,
          tool: "Platfòm mobil, done pri + enfòmasyon taks fwontyè + to echanj + meteo. Telefòn senp, kòd apèl.",
          population:
            "1,100 machann ki travèse fwontyè, 80%+ fanm — analog dirèk ak madan sara",
          result:
            "Ogmante komès, plis benefis, aksè mache pi laj, pri konsomatè pi ba",
          limitation: "PA te redui koripsyon/ekstòsyon nan pwent fwontyè yo",
          keyLesson:
            "Enfòmasyon fonksyone — men li pa rezoud pwoblèm pouvwa sou teren an",
          source: "J-PAL RCT, Wiseman (2023)",
        },
        {
          name: "Esoko",
          location: "Ghana",
          years: "2007-prezan",
          status: "success" as const,
          tool: "Alèt pri SMS, 58 pwodwi, 42 mache, 12 lang lokal, $0.50/mwa",
          population: "Machann ak kiltivatè nan tout Ghana",
          result:
            "+10% pri pou mayi, +7% pou pistach; 9% ogmantasyon revni; 200% ROI",
          keyLesson: "SMS pou kont li pa ase — vwa + meteo + konsèy obligatwa",
          source:
            "Courois & Subervie (American Journal of Agricultural Economics)",
        },
        {
          name: "Kudu",
          location: "Uganda",
          years: "2015-2018",
          status: "partial" as const,
          tool: "Mache pwodwi dijital + difizyon pri SMS",
          population: "Machann ak kiltivatè nan Uganda",
          result:
            "Te mache pou machann, te a pèn mache pou kiltivatè; platfòm kaptire pa pi gwo machann yo",
          keyLesson:
            "San pwoteksyon nan konsepsyon, platfòm benefisye moun ki deja avantaje",
          source: "Evalyasyon J-PAL",
        },
      ],
      failure: [
        {
          name: "Reuters Market Light",
          location: "India",
          years: "2007-2012",
          status: "failure" as const,
          tool: "Abònman SMS peye ($1.50/mwa), pri rekòt lokal + meteo",
          population: "Kiltivatè nan Inde",
          result: "RCT pa t jwenn OKENN efè estatistikman siyifikatif",
          keyLesson:
            "Abònman peye = adopsyon ba; aktivasyon konplike = 41% abandone. Gratis, senp, lang lokal, aksè pa vwa. Pa janm fè peye.",
          source: "Fafchamps & Minten, World Bank Economic Review (2012)",
        },
      ],
    },
  },
  en: {
    successTitle: "What worked",
    failureTitle: "What failed",
    toolLabel: "Tool",
    populationLabel: "Population",
    resultLabel: "Result",
    limitationLabel: "Limitation",
    keyLessonLabel: "Key lesson",
    sourceLabel: "Source",
    cases: {
      success: [
        {
          name: "Sauti East Africa",
          location: "Kenya/Uganda",
          years: "2021",
          status: "success" as const,
          tool: "Mobile platform, price data + border tax info + exchange rates + weather. Feature phone, dial-in code.",
          population:
            "1,100 cross-border traders, 80%+ women — direct analog to madan sara",
          result:
            "Increased trading, higher profits, wider market access, lower consumer prices",
          limitation: "Did NOT reduce corruption/extortion at border crossings",
          keyLesson:
            "Information works — but it doesn't solve on-the-ground power problems",
          source: "J-PAL RCT, Wiseman (2023)",
        },
        {
          name: "Esoko",
          location: "Ghana",
          years: "2007-present",
          status: "success" as const,
          tool: "SMS price alerts, 58 commodities, 42 markets, 12 local languages, $0.50/month",
          population: "Traders and farmers across Ghana",
          result:
            "+10% price for maize, +7% for groundnuts; 9% income increase; 200% ROI",
          keyLesson: "SMS alone insufficient — voice + weather + tips required",
          source:
            "Courois & Subervie (American Journal of Agricultural Economics)",
        },
        {
          name: "Kudu",
          location: "Uganda",
          years: "2015-2018",
          status: "partial" as const,
          tool: "Digital commodity marketplace + SMS price broadcast",
          population: "Traders and farmers in Uganda",
          result:
            "Worked for traders, barely worked for farmers; platform captured by larger traders",
          keyLesson:
            "Without design safeguards, platforms benefit the already-advantaged",
          source: "J-PAL evaluation",
        },
      ],
      failure: [
        {
          name: "Reuters Market Light",
          location: "India",
          years: "2007-2012",
          status: "failure" as const,
          tool: "Paid SMS subscription ($1.50/month), localized crop prices + weather",
          population: "Farmers in India",
          result: "RCT found NO statistically significant effect",
          keyLesson:
            "Paid subscription = low adoption; complex activation = 41% dropout. Free, simple, local-language, voice-accessible. Never charge.",
          source: "Fafchamps & Minten, World Bank Economic Review (2012)",
        },
      ],
    },
  },
};

function StatusBadge({ status }: { status: "success" | "partial" | "failure" }) {
  const config = {
    success: {
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      bgColor: "bg-alert-green/20",
      textColor: "text-alert-green",
      borderColor: "border-alert-green",
    },
    partial: {
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
      bgColor: "bg-amber/20",
      textColor: "text-amber-600",
      borderColor: "border-amber",
    },
    failure: {
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      ),
      bgColor: "bg-alert-red/20",
      textColor: "text-alert-red",
      borderColor: "border-alert-red",
    },
  };

  const { icon, bgColor, textColor } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
    >
      {icon}
    </span>
  );
}

function CaseCard({
  caseStudy,
  labels,
}: {
  caseStudy: CaseStudy;
  labels: {
    toolLabel: string;
    populationLabel: string;
    resultLabel: string;
    limitationLabel: string;
    keyLessonLabel: string;
    sourceLabel: string;
  };
}) {
  const borderColorMap = {
    success: "border-l-alert-green",
    partial: "border-l-amber",
    failure: "border-l-alert-red",
  };

  return (
    <div
      className={`bg-parchment-light rounded-lg border border-parchment-dark/30 border-l-4 ${borderColorMap[caseStudy.status]} overflow-hidden`}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-parchment-dark/20 flex items-start justify-between gap-4">
        <div>
          <h4 className="font-display text-lg text-indigo">
            {caseStudy.name}
          </h4>
          <p className="font-body text-sm text-indigo/60">
            {caseStudy.location} ({caseStudy.years})
          </p>
        </div>
        <StatusBadge status={caseStudy.status} />
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-4">
        {/* Tool */}
        <div>
          <span className="font-display text-xs text-terracotta uppercase tracking-wide">
            {labels.toolLabel}
          </span>
          <p className="font-body text-sm text-indigo/80 mt-1">
            {caseStudy.tool}
          </p>
        </div>

        {/* Population */}
        <div>
          <span className="font-display text-xs text-terracotta uppercase tracking-wide">
            {labels.populationLabel}
          </span>
          <p className="font-body text-sm text-indigo/80 mt-1">
            {caseStudy.population}
          </p>
        </div>

        {/* Result */}
        <div>
          <span className="font-display text-xs text-terracotta uppercase tracking-wide">
            {labels.resultLabel}
          </span>
          <p className="font-body text-sm text-indigo/80 mt-1">
            {caseStudy.result}
          </p>
        </div>

        {/* Limitation (if exists) */}
        {caseStudy.limitation && (
          <div>
            <span className="font-display text-xs text-amber-600 uppercase tracking-wide">
              {labels.limitationLabel}
            </span>
            <p className="font-body text-sm text-indigo/80 mt-1">
              {caseStudy.limitation}
            </p>
          </div>
        )}

        {/* Key Lesson */}
        <div className="bg-indigo/5 rounded-lg p-3 mt-4">
          <span className="font-display text-xs text-indigo uppercase tracking-wide">
            {labels.keyLessonLabel}
          </span>
          <p className="font-body text-sm text-indigo font-medium mt-1">
            {caseStudy.keyLesson}
          </p>
        </div>

        {/* Source */}
        <div className="pt-2 border-t border-parchment-dark/20">
          <span className="font-body text-xs text-indigo/50">
            {labels.sourceLabel}: {caseStudy.source}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ComparativeCases() {
  const { language, t } = useLanguage();
  const content = caseStudiesContent[language];

  const labels = {
    toolLabel: content.toolLabel,
    populationLabel: content.populationLabel,
    resultLabel: content.resultLabel,
    limitationLabel: content.limitationLabel,
    keyLessonLabel: content.keyLessonLabel,
    sourceLabel: content.sourceLabel,
  };

  return (
    <section className="mb-16">
      {/* Section Header */}
      <h2 className="font-display text-2xl md:text-3xl text-indigo mb-8">
        {t("rechech.cases.title")}
      </h2>

      {/* Success Cases */}
      <div className="mb-10">
        <h3 className="font-display text-xl text-alert-green mb-4 flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {content.successTitle}
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {content.cases.success.map((caseStudy) => (
            <CaseCard
              key={caseStudy.name}
              caseStudy={caseStudy}
              labels={labels}
            />
          ))}
        </div>
      </div>

      {/* Failure Cases */}
      <div>
        <h3 className="font-display text-xl text-alert-red mb-4 flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {content.failureTitle}
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {content.cases.failure.map((caseStudy) => (
            <CaseCard
              key={caseStudy.name}
              caseStudy={caseStudy}
              labels={labels}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
