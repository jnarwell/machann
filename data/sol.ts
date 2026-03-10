export interface SolMember {
  id: string;
  name: string;
  location: string;
  status: "paid" | "recipient" | "upcoming" | "late";
  paidAmount: number;
  avatarColor: string;
  initials: string;
}

export interface SolGroup {
  groupName: string;
  ownerName: string;
  currentCycle: number;
  totalCycles: number;
  poolPerCycle: number;
  contributionPerMember: number;
  currentRecipientIndex: number;
  nextCycleDate: string;
  members: SolMember[];
}

export const solGroup: SolGroup = {
  groupName: "Sòl Gwoup Anite",
  ownerName: "Anite",
  currentCycle: 4,
  totalCycles: 8,
  poolPerCycle: 25000,
  contributionPerMember: 5000,
  currentRecipientIndex: 1, // Fabiola (0-indexed)
  nextCycleDate: "14 Avril 2026",
  members: [
    {
      id: "anite",
      name: "Anite Désir",
      location: "Silo, Delmas 33",
      status: "paid",
      paidAmount: 5000,
      avatarColor: "#C1440E", // Terracotta
      initials: "AD",
    },
    {
      id: "fabiola",
      name: "Fabiola Mérilus",
      location: "Kenskoff",
      status: "recipient",
      paidAmount: 5000,
      avatarColor: "#D4872A", // Amber
      initials: "FM",
    },
    {
      id: "josiane",
      name: "Josiane Pierre",
      location: "Croix-des-Bossales",
      status: "paid",
      paidAmount: 5000,
      avatarColor: "#6B7C5E", // Sage
      initials: "JP",
    },
    {
      id: "marieclaire",
      name: "Marie-Claire Luc",
      location: "Artibonite",
      status: "paid",
      paidAmount: 5000,
      avatarColor: "#7587B1", // Light indigo
      initials: "ML",
    },
    {
      id: "claudette",
      name: "Claudette Toussaint",
      location: "Tête Bœuf",
      status: "late",
      paidAmount: 0,
      avatarColor: "#B83232", // Alert red
      initials: "CT",
    },
  ],
};

export interface GroupMessage {
  id: string;
  senderId: string;
  senderName: string;
  messageKR: string;
  messageEN: string;
  timestamp: string;
}

export const groupMessages: GroupMessage[] = [
  {
    id: "msg1",
    senderId: "marieclaire",
    senderName: "Madan Claire",
    messageKR: "Pri diri nan Gonayiv tonbe jodi a, bon moman pou achte!",
    messageEN: "Rice price in Gonaïves dropped today, good time to buy!",
    timestamp: "2026-03-03T08:15:00",
  },
  {
    id: "msg2",
    senderId: "anite",
    senderName: "Anite",
    messageKR: "Mèsi! Mwen pral ale denmen",
    messageEN: "Thanks! I'm going tomorrow",
    timestamp: "2026-03-03T08:22:00",
  },
  {
    id: "msg3",
    senderId: "fabiola",
    senderName: "Fabiola",
    messageKR: "Atansyon — wout Artibonite gen pwoblèm jounen an",
    messageEN: "Careful — Artibonite road has problems today",
    timestamp: "2026-03-03T09:45:00",
  },
];
