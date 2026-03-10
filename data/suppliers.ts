export interface Supplier {
  id: string;
  name: string;
  location: string;
  specialties: string[]; // commodityIds
  rating: number; // 1-5
  lastTrade: string;
  notes: string;
  notesEN: string;
}

export const suppliers: Supplier[] = [
  {
    id: "tijan",
    name: "Ti Jan",
    location: "Gonayiv",
    specialties: ["rice", "palmoil"],
    rating: 5,
    lastTrade: "2026-02-28",
    notes: "Toujou fre, bon kalite. Li gen aksè dirèk nan moulen diri.",
    notesEN: "Always fresh, good quality. Has direct access to rice mill.",
  },
  {
    id: "madanpaul",
    name: "Madan Paul",
    location: "Kenskoff",
    specialties: ["maize", "plantain"],
    rating: 4,
    lastTrade: "2026-02-25",
    notes: "Pwodui lokal sèlman. Pri lejèman pi wo men kalite ekselan.",
    notesEN: "Local produce only. Prices slightly higher but excellent quality.",
  },
  {
    id: "frejoseph",
    name: "Frè Joseph",
    location: "Atibonit",
    specialties: ["beans"],
    rating: 3,
    lastTrade: "2026-02-12",
    notes: "Bon pwa, men pafwa anreta sou livrezon.",
    notesEN: "Good beans, but sometimes late on delivery.",
  },
  {
    id: "semarie",
    name: "Sè Marie",
    location: "Sid",
    specialties: ["fish"],
    rating: 4,
    lastTrade: "2026-02-12",
    notes: "Pwason seche kalite siperyè. Travay ak pechè lokal yo.",
    notesEN: "Superior quality dried fish. Works with local fishermen.",
  },
  {
    id: "bospierre",
    name: "Bos Pierre",
    location: "Nò",
    specialties: ["maize", "beans"],
    rating: 4,
    lastTrade: "2026-01-28",
    notes: "Gwo kantite disponib. Bon pou achte an gwo.",
    notesEN: "Large quantities available. Good for bulk purchases.",
  },
];

export function getSupplierById(id: string): Supplier | undefined {
  return suppliers.find((s) => s.id === id);
}

export function getSuppliersBySpecialty(commodityId: string): Supplier[] {
  return suppliers.filter((s) => s.specialties.includes(commodityId));
}
