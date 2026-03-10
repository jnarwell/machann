"use client";

import { useLanguage } from "@/contexts/LanguageContext";

type ContextItem = {
  title: string;
  subtitle: string;
  content: string;
  highlight?: string;
};

const contextContent = {
  kr: {
    items: [
      {
        title: "Sistèm Pratik",
        subtitle: "Hossein 2015; Lacombe et al. 2025",
        content:
          "Madan sara deja gen enfrastrikti enstitisyonèl ki bati sou konfyans, solidarite, ak resipwosite. Platfòm sa a nimerizé sa ki deja ap fonksyone — li pa envante nouvo sistèm, li ranfòse sa ki egziste.",
        highlight:
          "Sòl se pa sèlman epay — se prèv kredi, rezo sipò, ak estrikti sosyal.",
      },
      {
        title: "Pyèj Komèsan",
        subtitle: "Schwartz Research Group",
        content:
          "Komèsan an ofri kredi san enterè sou machandiz enpòte → madan sara revann pi ba pase pri reyèl → benefis sou pwodui lokal sibvansyone grenn Etazini sibvansyone. Sa kreye yon sik depandans kote madan sara travay pou komèsan an olye de pou tèt yo.",
        highlight:
          "Transparans pri kase sik la — lè madan sara konnen pri reyèl, yo ka negosye pi byen.",
      },
      {
        title: "Fonkoze",
        subtitle: "Est. 1994",
        content:
          "Pi gwo enstitisyon mikwofinans nan Ayiti, 46 branch, 90%+ riral. Prè solidarite (prè kòmanse $75, gwoup 5 moun). Modèl solidarite a rekonèt istwa patisipasyon sòl kòm prèv fyabilite finansyè.",
        highlight: "46 branch atravè Ayiti, prè kòmanse nan $75 USD.",
      },
      {
        title: "MonCash",
        subtitle: "Digicel, rebaptize 2015",
        content:
          "2M+ itilizatè, 2,000+ ajan nasyonalman. 80% popilasyon adilt pa gen kont bank tradisyonèl, men MonCash ap grandi. Enfrastrikti a deja la — platfòm nou an konstwi sou li.",
        highlight:
          "2M+ itilizatè aktif — rezo ki deja etabli pou transfè dijital.",
      },
      {
        title: "RAMSA",
        subtitle: "Rassemblement des Madan Sara d'Haïti",
        content:
          "Premye òganizasyon ki dokimante ak defann gwoup la. RAMSA reprezante vwa kolektif madan sara yo epi travay pou rekonesans legal ak pwoteksyon dwa yo.",
        highlight: "Premye vwa kolektif pou madan sara nan nivo nasyonal.",
      },
    ],
  },
  en: {
    items: [
      {
        title: "Sistèm Pratik",
        subtitle: "Hossein 2015; Lacombe et al. 2025",
        content:
          "The madan sara already have institutional infrastructure built on trust, solidarity, and reciprocity. This platform digitizes what already works — it doesn't invent new systems, it strengthens existing ones.",
        highlight:
          "Sòl is not just savings — it's credit proof, support networks, and social structure.",
      },
      {
        title: "The Komèsan Trap",
        subtitle: "Schwartz Research Group",
        content:
          "The komèsan offers zero-interest credit on imported goods → madan sara resell at below-cost → profits from domestic produce subsidize subsidized US grain. This creates a dependency cycle where madan sara work for the komèsan rather than for themselves.",
        highlight:
          "Price transparency breaks the cycle — when madan sara know real prices, they can negotiate better.",
      },
      {
        title: "Fonkoze",
        subtitle: "Est. 1994",
        content:
          "Largest MFI in Haiti, 46 branches, 90%+ rural. Solidarity lending ($75 starting loans, groups of 5). The solidarity model recognizes sòl participation history as proof of financial reliability.",
        highlight: "46 branches across Haiti, loans starting at $75 USD.",
      },
      {
        title: "MonCash",
        subtitle: "Digicel, rebranded 2015",
        content:
          "2M+ users, 2,000+ agents nationally. 80% adult population unbanked but MonCash growing. The infrastructure is already there — our platform builds on it.",
        highlight:
          "2M+ active users — network already established for digital transfers.",
      },
      {
        title: "RAMSA",
        subtitle: "Rassemblement des Madan Sara d'Haïti",
        content:
          "First organization to document and advocate for the group. RAMSA represents the collective voice of madan sara and works for legal recognition and rights protection.",
        highlight:
          "First collective voice for madan sara at the national level.",
      },
    ],
  },
};

function ContextCard({ item }: { item: ContextItem }) {
  return (
    <div className="bg-parchment-light rounded-lg border border-parchment-dark/30 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-parchment-dark/20">
        <h4 className="font-display text-lg text-indigo">{item.title}</h4>
        <p className="font-mono text-xs text-terracotta mt-1">
          {item.subtitle}
        </p>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        <p className="font-body text-indigo/80 leading-relaxed mb-4">
          {item.content}
        </p>

        {/* Highlight */}
        {item.highlight && (
          <div className="bg-sage/10 border-l-4 border-sage rounded-r-lg px-4 py-3">
            <p className="font-body text-sm text-sage-700 italic">
              {item.highlight}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HaitianContext() {
  const { language, t } = useLanguage();
  const content = contextContent[language];

  return (
    <section className="mb-16">
      {/* Section Header */}
      <h2 className="font-display text-2xl md:text-3xl text-indigo mb-8">
        {t("rechech.context.title")}
      </h2>

      {/* Context Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {content.items.map((item, index) => (
          <ContextCard key={index} item={item} />
        ))}
      </div>
    </section>
  );
}
