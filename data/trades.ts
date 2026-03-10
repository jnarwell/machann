export interface Trade {
  id: string;
  date: string;
  commodityId: string;
  qty: number;
  unit: string;
  supplier: string;
  marketBought: string;
  pricePaid: number;
  marketSold: string;
  priceReceived: number;
  margin: number; // Calculated as percentage
}

export const trades: Trade[] = [
  {
    id: "trade1",
    date: "2026-02-28",
    commodityId: "rice",
    qty: 40,
    unit: "kg",
    supplier: "Ti Jan",
    marketBought: "Gonayiv",
    pricePaid: 52,
    marketSold: "Pòtoprens",
    priceReceived: 68,
    margin: 30.8,
  },
  {
    id: "trade2",
    date: "2026-02-25",
    commodityId: "maize",
    qty: 60,
    unit: "kg",
    supplier: "Madan Paul",
    marketBought: "Kenskoff",
    pricePaid: 28,
    marketSold: "Delmas 33",
    priceReceived: 35,
    margin: 25.0,
  },
  {
    id: "trade3",
    date: "2026-02-22",
    commodityId: "beans",
    qty: 25,
    unit: "kg",
    supplier: "Frè Joseph",
    marketBought: "Atibonit",
    pricePaid: 78,
    marketSold: "Pòtoprens",
    priceReceived: 95,
    margin: 21.8,
  },
  {
    id: "trade4",
    date: "2026-02-18",
    commodityId: "plantain",
    qty: 15,
    unit: "pakèt",
    supplier: "Madan Paul",
    marketBought: "Kenskoff",
    pricePaid: 35,
    marketSold: "Delmas 33",
    priceReceived: 45,
    margin: 28.6,
  },
  {
    id: "trade5",
    date: "2026-02-15",
    commodityId: "palmoil",
    qty: 10,
    unit: "lit",
    supplier: "Ti Jan",
    marketBought: "Gonayiv",
    pricePaid: 195,
    marketSold: "Pòtoprens",
    priceReceived: 220,
    margin: 12.8,
  },
  {
    id: "trade6",
    date: "2026-02-12",
    commodityId: "fish",
    qty: 8,
    unit: "kg",
    supplier: "Sè Marie",
    marketBought: "Sid",
    pricePaid: 155,
    marketSold: "Pòtoprens",
    priceReceived: 185,
    margin: 19.4,
  },
  {
    id: "trade7",
    date: "2026-02-08",
    commodityId: "rice",
    qty: 50,
    unit: "kg",
    supplier: "Ti Jan",
    marketBought: "Gonayiv",
    pricePaid: 48,
    marketSold: "Pòtoprens",
    priceReceived: 62,
    margin: 29.2,
  },
  {
    id: "trade8",
    date: "2026-02-05",
    commodityId: "maize",
    qty: 45,
    unit: "kg",
    supplier: "Frè Joseph",
    marketBought: "Atibonit",
    pricePaid: 26,
    marketSold: "Pòtoprens",
    priceReceived: 33,
    margin: 26.9,
  },
];

export const markets = [
  "Pòtoprens",
  "Delmas 33",
  "Croix-des-Bossales",
  "Gonayiv",
  "Kenskoff",
  "Atibonit",
  "Sid",
  "Nò",
  "Sant",
  "Tête Bœuf",
];
