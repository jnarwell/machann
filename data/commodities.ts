// Generate realistic price history with volatility
function generatePriceHistory(basePrice: number, volatility: number = 0.15): number[] {
  const history: number[] = [];
  let price = basePrice * (1 - volatility / 2); // Start slightly lower

  for (let i = 0; i < 30; i++) {
    const change = (Math.random() - 0.5) * volatility * basePrice;
    price = Math.max(price + change, basePrice * 0.5);
    price = Math.min(price, basePrice * 1.5);
    history.push(Math.round(price * 100) / 100);
  }

  // Ensure last price matches current price
  history[29] = basePrice;
  return history;
}

export interface Commodity {
  id: string;
  nameKR: string;
  nameEN: string;
  icon: string;
  unit: string;
  unitKeyKR: string;
  unitKeyEN: string;
  currentPrice: number;
  priceHistory: number[];
  change7d: number;
  change30d: number;
  regionalPrices: {
    portauprince: number;
    artibonite: number;
    north: number;
    south: number;
    center?: number;
    northwest?: number;
  };
  trend: "up" | "down" | "stable";
}

export const commodities: Commodity[] = [
  {
    id: "rice",
    nameKR: "Diri kole",
    nameEN: "Broken rice",
    icon: "\u25B3", // △ triangle (grain)
    unit: "kg",
    unitKeyKR: "/ kg",
    unitKeyEN: "/ kg",
    currentPrice: 68,
    priceHistory: generatePriceHistory(68, 0.22),
    change7d: 12,
    change30d: 22,
    regionalPrices: {
      portauprince: 68,
      artibonite: 52,
      north: 58,
      south: 62,
      center: 55,
      northwest: 60,
    },
    trend: "up",
  },
  {
    id: "maize",
    nameKR: "Mayi",
    nameEN: "Maize",
    icon: "\u25C7", // ◇ diamond (corn kernel)
    unit: "kg",
    unitKeyKR: "/ kg",
    unitKeyEN: "/ kg",
    currentPrice: 32,
    priceHistory: generatePriceHistory(32, 0.12),
    change7d: 3,
    change30d: 8,
    regionalPrices: {
      portauprince: 35,
      artibonite: 28,
      north: 30,
      south: 32,
      center: 29,
      northwest: 31,
    },
    trend: "up",
  },
  {
    id: "beans",
    nameKR: "Pwa nwa",
    nameEN: "Black beans",
    icon: "\u25CF", // ● filled circle (bean)
    unit: "kg",
    unitKeyKR: "/ kg",
    unitKeyEN: "/ kg",
    currentPrice: 95,
    priceHistory: generatePriceHistory(95, 0.08),
    change7d: -1,
    change30d: 2,
    regionalPrices: {
      portauprince: 95,
      artibonite: 88,
      north: 92,
      south: 90,
      center: 89,
      northwest: 91,
    },
    trend: "stable",
  },
  {
    id: "fish",
    nameKR: "Pwason",
    nameEN: "Fish (dried)",
    icon: "\u224B", // ≋ triple tilde (fish scales)
    unit: "kg",
    unitKeyKR: "/ kg",
    unitKeyEN: "/ kg",
    currentPrice: 185,
    priceHistory: generatePriceHistory(185, 0.1),
    change7d: -2,
    change30d: -5,
    regionalPrices: {
      portauprince: 185,
      artibonite: 195,
      north: 175,
      south: 165,
      center: 180,
      northwest: 170,
    },
    trend: "down",
  },
  {
    id: "plantain",
    nameKR: "Bannann",
    nameEN: "Plantain",
    icon: "\u2312", // ⌒ arc (curved fruit)
    unit: "pakèt",
    unitKeyKR: "/ pakèt",
    unitKeyEN: "/ bunch",
    currentPrice: 45,
    priceHistory: generatePriceHistory(45, 0.08),
    change7d: 0,
    change30d: 1,
    regionalPrices: {
      portauprince: 45,
      artibonite: 38,
      north: 42,
      south: 40,
      center: 39,
      northwest: 41,
    },
    trend: "stable",
  },
  {
    id: "palmoil",
    nameKR: "Lwil palma",
    nameEN: "Palm oil",
    icon: "\u25C9", // ◉ fisheye (oil droplet)
    unit: "lit",
    unitKeyKR: "/ lit",
    unitKeyEN: "/ liter",
    currentPrice: 220,
    priceHistory: generatePriceHistory(220, 0.15),
    change7d: 5,
    change30d: 12,
    regionalPrices: {
      portauprince: 220,
      artibonite: 205,
      north: 210,
      south: 215,
      center: 208,
      northwest: 212,
    },
    trend: "up",
  },
  {
    id: "fuel",
    nameKR: "Gaz",
    nameEN: "Fuel (gasoline)",
    icon: "\u2302", // ⌂ house/pump shape
    unit: "galon",
    unitKeyKR: "/ galon",
    unitKeyEN: "/ gallon",
    currentPrice: 980,
    priceHistory: generatePriceHistory(980, 0.05),
    change7d: -1,
    change30d: -3,
    regionalPrices: {
      portauprince: 980,
      artibonite: 1020,
      north: 1050,
      south: 1010,
      center: 1030,
      northwest: 1060,
    },
    trend: "down",
  },
];

export const regions = [
  { id: "all", nameKR: "Tout Peyi", nameEN: "All Haiti" },
  { id: "portauprince", nameKR: "Pòtoprens", nameEN: "Port-au-Prince" },
  { id: "artibonite", nameKR: "Atibonit", nameEN: "Artibonite" },
  { id: "north", nameKR: "Nò", nameEN: "North" },
  { id: "south", nameKR: "Sid", nameEN: "South" },
  { id: "centre", nameKR: "Sant", nameEN: "Centre" },
  { id: "northwest", nameKR: "Nòdwès", nameEN: "Northwest" },
];
