import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create demo users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { id: "demo-user-1" },
      update: {},
      create: {
        id: "demo-user-1",
        name: "Anite Desir",
        phone: "+509-3456-7890",
        location: "Silo, Delmas 33",
        avatarColor: "#C1440E",
        initials: "AD",
      },
    }),
    prisma.user.upsert({
      where: { id: "user-fabiola" },
      update: {},
      create: {
        id: "user-fabiola",
        name: "Fabiola Merilus",
        phone: "+509-3456-7891",
        location: "Kenskoff",
        avatarColor: "#D4872A",
        initials: "FM",
      },
    }),
    prisma.user.upsert({
      where: { id: "user-josiane" },
      update: {},
      create: {
        id: "user-josiane",
        name: "Josiane Pierre",
        phone: "+509-3456-7892",
        location: "Croix-des-Bossales",
        avatarColor: "#6B7C5E",
        initials: "JP",
      },
    }),
    prisma.user.upsert({
      where: { id: "user-marieclaire" },
      update: {},
      create: {
        id: "user-marieclaire",
        name: "Marie-Claire Luc",
        phone: "+509-3456-7893",
        location: "Artibonite",
        avatarColor: "#7587B1",
        initials: "ML",
      },
    }),
    prisma.user.upsert({
      where: { id: "user-claudette" },
      update: {},
      create: {
        id: "user-claudette",
        name: "Claudette Toussaint",
        phone: "+509-3456-7894",
        location: "Tete Boeuf",
        avatarColor: "#B83232",
        initials: "CT",
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // Create user consent settings
  const consentData = [
    { userId: "demo-user-1", shareWithGroup: true, shareWithRegion: true, shareWithNetwork: false },
    { userId: "user-fabiola", shareWithGroup: true, shareWithRegion: false, shareWithNetwork: false },
    { userId: "user-josiane", shareWithGroup: true, shareWithRegion: true, shareWithNetwork: true },
    { userId: "user-marieclaire", shareWithGroup: true, shareWithRegion: true, shareWithNetwork: false },
    { userId: "user-claudette", shareWithGroup: false, shareWithRegion: false, shareWithNetwork: false },
  ];

  for (const consent of consentData) {
    await prisma.userConsent.upsert({
      where: { userId: consent.userId },
      update: consent,
      create: consent,
    });
  }

  console.log("Created user consent settings");

  // Create suppliers
  const suppliers = await Promise.all([
    prisma.supplier.upsert({
      where: { id: "supplier-tijan" },
      update: {},
      create: {
        id: "supplier-tijan",
        name: "Ti Jan",
        phone: "+509-4567-1234",
        location: "Gonayiv",
        commodities: "rice,oil",
        rating: 4.5,
        reviewCount: 12,
        isVerified: true,
      },
    }),
    prisma.supplier.upsert({
      where: { id: "supplier-madanpaul" },
      update: {},
      create: {
        id: "supplier-madanpaul",
        name: "Madan Paul",
        phone: "+509-4567-1235",
        location: "Kenskoff",
        commodities: "maize,plantain",
        rating: 4.2,
        reviewCount: 8,
        isVerified: true,
      },
    }),
    prisma.supplier.upsert({
      where: { id: "supplier-frejoseph" },
      update: {},
      create: {
        id: "supplier-frejoseph",
        name: "Fre Joseph",
        phone: "+509-4567-1236",
        location: "Atibonit",
        commodities: "beans,maize",
        rating: 4.0,
        reviewCount: 5,
        isVerified: false,
      },
    }),
    prisma.supplier.upsert({
      where: { id: "supplier-semarie" },
      update: {},
      create: {
        id: "supplier-semarie",
        name: "Se Marie",
        phone: "+509-4567-1237",
        location: "Sid",
        commodities: "fish",
        rating: 4.8,
        reviewCount: 15,
        isVerified: true,
      },
    }),
  ]);

  console.log(`Created ${suppliers.length} suppliers`);

  // Create sol group with sharing settings
  const solGroup = await prisma.solGroup.upsert({
    where: { id: "demo-sol-group-1" },
    update: {
      shareGroupPrices: true,
      regionId: "portauprince",
    },
    create: {
      id: "demo-sol-group-1",
      groupName: "Sol Gwoup Anite",
      currentCycle: 4,
      totalCycles: 8,
      poolPerCycle: 25000,
      contributionPerMember: 5000,
      currentRecipientIndex: 1,
      nextCycleDate: new Date("2026-04-14"),
      status: "active",
      shareGroupPrices: true,
      regionId: "portauprince",
    },
  });

  console.log("Created sol group:", solGroup.groupName);

  // Add members to sol group
  const memberData = [
    { userId: "demo-user-1", status: "paid", paidAmount: 5000, cycleOrder: 0 },
    { userId: "user-fabiola", status: "recipient", paidAmount: 5000, cycleOrder: 1 },
    { userId: "user-josiane", status: "paid", paidAmount: 5000, cycleOrder: 2 },
    { userId: "user-marieclaire", status: "paid", paidAmount: 5000, cycleOrder: 3 },
    { userId: "user-claudette", status: "late", paidAmount: 0, cycleOrder: 4 },
  ];

  for (const member of memberData) {
    await prisma.solMember.upsert({
      where: {
        userId_solGroupId: {
          userId: member.userId,
          solGroupId: solGroup.id,
        },
      },
      update: {
        status: member.status,
        paidAmount: member.paidAmount,
      },
      create: {
        userId: member.userId,
        solGroupId: solGroup.id,
        status: member.status,
        paidAmount: member.paidAmount,
        cycleOrder: member.cycleOrder,
      },
    });
  }

  console.log("Added 5 members to sol group");

  // Clear existing trades to avoid duplicates
  await prisma.trade.deleteMany({});

  // Create sample trades with transport fields
  const trades = [
    {
      date: new Date("2026-02-28"),
      commodityId: "rice",
      qty: 40,
      unit: "kg",
      supplierId: "supplier-tijan",
      marketBought: "Gonayiv",
      pricePaid: 52,
      marketSold: "Potoprens",
      priceReceived: 68,
      margin: 30.8,
      userId: "demo-user-1",
      transportCostHtg: 150,
      transportMode: "tap-tap",
      roadCondition: "bon",
      weatherCondition: "soley",
    },
    {
      date: new Date("2026-02-25"),
      commodityId: "maize",
      qty: 60,
      unit: "kg",
      supplierId: "supplier-madanpaul",
      marketBought: "Kenskoff",
      pricePaid: 28,
      marketSold: "Delmas 33",
      priceReceived: 35,
      margin: 25.0,
      userId: "demo-user-1",
      transportCostHtg: 75,
      transportMode: "moto",
      roadCondition: "pasab",
      weatherCondition: "soley",
    },
    {
      date: new Date("2026-02-22"),
      commodityId: "beans-black",
      qty: 25,
      unit: "kg",
      supplierId: "supplier-frejoseph",
      marketBought: "Atibonit",
      pricePaid: 78,
      marketSold: "Potoprens",
      priceReceived: 95,
      margin: 21.8,
      userId: "demo-user-1",
      transportCostHtg: 200,
      transportMode: "kamyon",
      roadCondition: "move",
      weatherCondition: "lapli",
    },
    {
      date: new Date("2026-02-18"),
      commodityId: "plantain",
      qty: 15,
      unit: "paket",
      supplierId: "supplier-madanpaul",
      marketBought: "Kenskoff",
      pricePaid: 35,
      marketSold: "Delmas 33",
      priceReceived: 45,
      margin: 28.6,
      userId: "demo-user-1",
      transportCostHtg: 50,
      transportMode: "pye",
      roadCondition: "bon",
      weatherCondition: "soley",
    },
    {
      date: new Date("2026-02-15"),
      commodityId: "oil",
      qty: 10,
      unit: "lit",
      supplierId: "supplier-tijan",
      marketBought: "Gonayiv",
      pricePaid: 195,
      marketSold: "Potoprens",
      priceReceived: 220,
      margin: 12.8,
      userId: "demo-user-1",
      transportCostHtg: 100,
      transportMode: "tap-tap",
      roadCondition: "pasab",
      weatherCondition: "soley",
    },
    // Additional trades from other users
    {
      date: new Date("2026-03-01"),
      commodityId: "rice",
      qty: 30,
      unit: "kg",
      supplierId: "supplier-tijan",
      marketBought: "Gonayiv",
      pricePaid: 55,
      marketSold: "Croix-des-Bossales",
      priceReceived: 72,
      margin: 30.9,
      userId: "user-josiane",
      transportCostHtg: 180,
      transportMode: "kamyon",
      roadCondition: "bon",
      weatherCondition: "soley",
    },
    {
      date: new Date("2026-02-27"),
      commodityId: "maize",
      qty: 45,
      unit: "kg",
      supplierId: "supplier-madanpaul",
      marketBought: "Kenskoff",
      pricePaid: 30,
      marketSold: "Croix-des-Bossales",
      priceReceived: 38,
      margin: 26.7,
      userId: "user-josiane",
      transportCostHtg: 60,
      transportMode: "moto",
      roadCondition: "bon",
      weatherCondition: "soley",
    },
  ];

  for (const trade of trades) {
    await prisma.trade.create({ data: trade });
  }

  console.log(`Created ${trades.length} sample trades`);

  // Create sample price reports
  const priceReports = [
    {
      commodityId: "rice",
      market: "Croix-des-Bossales",
      regionId: "portauprince",
      price: 70,
      unit: "kg",
      quality: "good",
      userId: "demo-user-1",
      observedAt: new Date("2026-03-02"),
    },
    {
      commodityId: "maize",
      market: "Mache Petion-Ville",
      regionId: "portauprince",
      price: 38,
      unit: "kg",
      quality: "good",
      userId: "user-fabiola",
      observedAt: new Date("2026-03-02"),
    },
    {
      commodityId: "beans-black",
      market: "Mache Gonayiv",
      regionId: "artibonite",
      price: 85,
      unit: "kg",
      quality: "excellent",
      userId: "user-marieclaire",
      observedAt: new Date("2026-03-01"),
    },
    {
      commodityId: "rice",
      market: "Mache Gonayiv",
      regionId: "artibonite",
      price: 58,
      unit: "kg",
      quality: "good",
      userId: "user-marieclaire",
      observedAt: new Date("2026-03-01"),
    },
    {
      commodityId: "plantain",
      market: "Croix-des-Bossales",
      regionId: "portauprince",
      price: 48,
      unit: "paket",
      quality: "fair",
      userId: "user-josiane",
      observedAt: new Date("2026-03-02"),
    },
  ];

  for (const report of priceReports) {
    await prisma.priceReport.create({ data: report });
  }

  console.log(`Created ${priceReports.length} price reports`);

  // Create sample messages
  await prisma.message.deleteMany({});

  const messages = [
    {
      content: "Pri diri nan Gonayiv tonbe jodi a, bon moman pou achte!",
      senderId: "user-marieclaire",
      solGroupId: "demo-sol-group-1",
      timestamp: new Date("2026-03-03T08:15:00"),
    },
    {
      content: "Mesi! Mwen pral ale denmen",
      senderId: "demo-user-1",
      solGroupId: "demo-sol-group-1",
      timestamp: new Date("2026-03-03T08:22:00"),
    },
    {
      content: "Atansyon - wout Artibonite gen pwoblem jounen an",
      senderId: "user-fabiola",
      solGroupId: "demo-sol-group-1",
      timestamp: new Date("2026-03-03T09:45:00"),
    },
  ];

  for (const msg of messages) {
    await prisma.message.create({ data: msg });
  }

  console.log(`Created ${messages.length} sample messages`);

  // Create sample price records with different sources
  const priceRecords = [
    {
      commodityId: "rice",
      price: 65,
      region: "portauprince",
      market: "Croix-des-Bossales",
      source: "fewsnet",
      recordDate: new Date("2026-03-01"),
    },
    {
      commodityId: "rice",
      price: 70,
      region: "portauprince",
      market: "Croix-des-Bossales",
      source: "user_generated",
      contributorCount: 3,
      confidenceScore: 0.85,
      recordDate: new Date("2026-03-02"),
    },
    {
      commodityId: "maize",
      price: 32,
      region: "portauprince",
      source: "fewsnet",
      recordDate: new Date("2026-03-01"),
    },
    {
      commodityId: "maize",
      price: 36,
      region: "portauprince",
      source: "user_generated",
      contributorCount: 2,
      confidenceScore: 0.7,
      recordDate: new Date("2026-03-02"),
    },
  ];

  for (const record of priceRecords) {
    await prisma.priceRecord.create({ data: record });
  }

  console.log(`Created ${priceRecords.length} price records`);

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
