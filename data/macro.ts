// Generate 90-day exchange rate history
function generateRateHistory(baseRate: number): { date: string; rate: number }[] {
  const history: { date: string; rate: number }[] = [];
  let rate = baseRate - 5;
  const startDate = new Date("2025-12-03");

  for (let i = 0; i < 90; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // Gradual upward trend with volatility
    const change = (Math.random() - 0.4) * 0.8;
    rate = Math.max(rate + change, baseRate - 10);
    rate = Math.min(rate, baseRate + 5);

    history.push({
      date: date.toISOString().split("T")[0],
      rate: Math.round(rate * 10) / 10,
    });
  }

  // Ensure last rate matches current
  history[89].rate = baseRate;
  return history;
}

export interface BRHData {
  official: number;
  street: number;
  history: { date: string; rate: number }[];
  lastUpdated: string;
  policyNoteKR: string;
  policyNoteEN: string;
}

export const brhData: BRHData = {
  official: 132.4,
  street: 138.2,
  history: generateRateHistory(132.4),
  lastUpdated: "2026-03-03",
  policyNoteKR: "BRH ogmante to enterè a 18% — sa ka rédui kredi disponib pou piti biznis",
  policyNoteEN: "BRH raised interest rate to 18% — this may reduce available credit for small businesses",
};

export interface NewsItem {
  id: string;
  date: string;
  titleKR: string;
  titleEN: string;
  category: "security" | "trade" | "policy" | "market" | "organization";
  impact: "positive" | "negative" | "neutral";
}

export const newsItems: NewsItem[] = [
  {
    id: "news1",
    date: "2026-03-02",
    titleKR: "Vyolans gang limite mache Croix-des-Bossales — 75% machann deplase",
    titleEN: "Gang violence restricts Croix-des-Bossales market — 75% of vendors displaced",
    category: "security",
    impact: "negative",
  },
  {
    id: "news2",
    date: "2026-03-01",
    titleKR: "WFP kòmanse distribisyon manje ijans nan Artibonite",
    titleEN: "WFP emergency food distribution begins in Artibonite",
    category: "market",
    impact: "neutral",
  },
  {
    id: "news3",
    date: "2026-02-28",
    titleKR: "Repiblik Dominikèn redui tarif sou ekspòtasyon agrikòl ayisyen",
    titleEN: "Dominican Republic reduces tariff on Haitian agricultural exports",
    category: "trade",
    impact: "positive",
  },
  {
    id: "news4",
    date: "2026-02-25",
    titleKR: "BRH: Depresiasyon HTG ralanti nan T1 2026",
    titleEN: "BRH: HTG depreciation slows in Q1 2026",
    category: "policy",
    impact: "positive",
  },
  {
    id: "news5",
    date: "2026-02-22",
    titleKR: "RAMSA mande fon mikrokredi ijans nan men gouvènman an",
    titleEN: "RAMSA demands emergency microloan fund from government",
    category: "organization",
    impact: "neutral",
  },
];

export interface ImportData {
  commodity: string;
  localShare: number;
  importedShare: number;
  subsidized: boolean;
  impactKR: string;
  impactEN: string;
}

export const importData: ImportData[] = [
  {
    commodity: "rice",
    localShare: 0.35,
    importedShare: 0.65,
    subsidized: true,
    impactKR: "Diri ameriken rive Ayiti a 30% mwen chè pase diri lokal akòz sibvansyon USDA. Sa fòse machann lokal vann a pri ki pa rentab.",
    impactEN: "American rice arrives 30% cheaper than local rice due to USDA subsidies. This forces local traders to sell at unprofitable prices.",
  },
  {
    commodity: "maize",
    localShare: 0.55,
    importedShare: 0.45,
    subsidized: true,
    impactKR: "Mayi enpòte benefisye de sibvansyon US Farm Bill. Pri lokal pi wo, men kalite pi bon.",
    impactEN: "Imported maize benefits from US Farm Bill subsidies. Local prices are higher, but quality is better.",
  },
  {
    commodity: "beans",
    localShare: 0.7,
    importedShare: 0.3,
    subsidized: false,
    impactKR: "Mache pwa plis lokal. Pri detèmine pa rekòt sezon ak kondisyon klimatik.",
    impactEN: "Bean market is more local. Prices determined by seasonal harvests and climate conditions.",
  },
];

export interface IMFData {
  programStatus: string;
  programStatusEN: string;
  lastConsultation: string;
  conditionKR: string;
  conditionEN: string;
  alertKR: string;
  alertEN: string;
}

export const imfData: IMFData = {
  programStatus: "Konsiltasyon Atik IV, 2024",
  programStatusEN: "Article IV Consultation, 2024",
  lastConsultation: "2024-06-15",
  conditionKR: "FMI rekòmande gouvènman redui sibvansyon gaz ak manje pou balanse bidjè. Sa ka lakòz pri monte pou konsomatè ak madan sara.",
  conditionEN: "IMF recommends government reduce fuel and food subsidies to balance budget. This may cause prices to rise for consumers and madan sara.",
  alertKR: "Pwogram FMI egzije redui sibvansyon — pri gaz ka ogmante",
  alertEN: "IMF program requires subsidy reduction — fuel prices may rise",
};

export interface BorderStatus {
  status: "open" | "restricted" | "closed";
  statusKR: string;
  statusEN: string;
  noteKR: string;
  noteEN: string;
}

export const borderStatus: BorderStatus = {
  status: "open",
  statusKR: "OUVÈ",
  statusEN: "OPEN",
  noteKR: "Fwontyè Dominikèn ouvri pou komès. Delè ladwàn mwayèn 4-6 èdtan.",
  noteEN: "Dominican border open for trade. Average customs delay 4-6 hours.",
};
