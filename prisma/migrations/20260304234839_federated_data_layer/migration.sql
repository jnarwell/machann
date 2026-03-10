-- AlterTable
ALTER TABLE "PriceRecord" ADD COLUMN "confidenceScore" REAL;
ALTER TABLE "PriceRecord" ADD COLUMN "contributorCount" INTEGER;
ALTER TABLE "PriceRecord" ADD COLUMN "sourceUrl" TEXT;

-- AlterTable
ALTER TABLE "Trade" ADD COLUMN "roadCondition" TEXT;
ALTER TABLE "Trade" ADD COLUMN "transportCostHtg" REAL;
ALTER TABLE "Trade" ADD COLUMN "transportMode" TEXT;
ALTER TABLE "Trade" ADD COLUMN "weatherCondition" TEXT;

-- CreateTable
CREATE TABLE "PriceReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commodityId" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "quality" TEXT,
    "observedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "PriceReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserConsent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "shareWithGroup" BOOLEAN NOT NULL DEFAULT false,
    "shareWithRegion" BOOLEAN NOT NULL DEFAULT false,
    "shareWithNetwork" BOOLEAN NOT NULL DEFAULT false,
    "anonymizeData" BOOLEAN NOT NULL DEFAULT true,
    "shareMargin" BOOLEAN NOT NULL DEFAULT false,
    "shareRoutes" BOOLEAN NOT NULL DEFAULT false,
    "consentVersion" INTEGER NOT NULL DEFAULT 1,
    "lastUpdated" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PriceContribution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commodityId" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "observedAt" DATETIME NOT NULL,
    "tradeId" TEXT,
    "priceReportId" TEXT,
    "userId" TEXT NOT NULL,
    "isAnonymized" BOOLEAN NOT NULL DEFAULT true,
    "consentTier" TEXT NOT NULL,
    "includedInGroupSignal" BOOLEAN NOT NULL DEFAULT false,
    "includedInRegionalSignal" BOOLEAN NOT NULL DEFAULT false,
    "includedInNationalSignal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PriceContribution_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PriceContribution_priceReportId_fkey" FOREIGN KEY ("priceReportId") REFERENCES "PriceReport" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GroupPriceSignal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "solGroupId" TEXT NOT NULL,
    "commodityId" TEXT NOT NULL,
    "market" TEXT,
    "regionId" TEXT NOT NULL,
    "avgPrice" REAL NOT NULL,
    "minPrice" REAL NOT NULL,
    "maxPrice" REAL NOT NULL,
    "medianPrice" REAL,
    "stdDeviation" REAL,
    "observationCount" INTEGER NOT NULL,
    "minObservations" INTEGER NOT NULL DEFAULT 3,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "shareConsent" BOOLEAN NOT NULL DEFAULT false,
    "shareWithRegion" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GroupPriceSignal_solGroupId_fkey" FOREIGN KEY ("solGroupId") REFERENCES "SolGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RegionalPriceSignal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "regionId" TEXT NOT NULL,
    "commodityId" TEXT NOT NULL,
    "avgPrice" REAL NOT NULL,
    "minPrice" REAL NOT NULL,
    "maxPrice" REAL NOT NULL,
    "medianPrice" REAL,
    "stdDeviation" REAL,
    "groupCount" INTEGER NOT NULL,
    "observationCount" INTEGER NOT NULL,
    "minGroups" INTEGER NOT NULL DEFAULT 2,
    "confidenceScore" REAL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NationalPriceSignal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commodityId" TEXT NOT NULL,
    "avgPrice" REAL NOT NULL,
    "minPrice" REAL NOT NULL,
    "maxPrice" REAL NOT NULL,
    "medianPrice" REAL,
    "stdDeviation" REAL,
    "regionalPrices" TEXT NOT NULL,
    "regionCount" INTEGER NOT NULL,
    "groupCount" INTEGER NOT NULL,
    "observationCount" INTEGER NOT NULL,
    "confidenceScore" REAL,
    "dataQuality" TEXT,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BusinessHealthSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "periodType" TEXT NOT NULL DEFAULT 'monthly',
    "totalRevenue" REAL NOT NULL,
    "totalCost" REAL NOT NULL,
    "totalTransportCost" REAL,
    "netProfit" REAL NOT NULL,
    "avgMargin" REAL NOT NULL,
    "tradeCount" INTEGER NOT NULL,
    "totalVolume" REAL,
    "topCommodities" TEXT NOT NULL,
    "topRoutes" TEXT NOT NULL,
    "topSuppliers" TEXT,
    "profitTrend" TEXT,
    "volumeTrend" TEXT,
    "marginTrend" TEXT,
    "groupRank" INTEGER,
    "regionAvgMargin" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BusinessHealthSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SolGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupName" TEXT NOT NULL,
    "currentCycle" INTEGER NOT NULL DEFAULT 1,
    "totalCycles" INTEGER NOT NULL,
    "poolPerCycle" REAL NOT NULL,
    "contributionPerMember" REAL NOT NULL,
    "currentRecipientIndex" INTEGER NOT NULL DEFAULT 0,
    "nextCycleDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "shareGroupPrices" BOOLEAN NOT NULL DEFAULT false,
    "regionId" TEXT
);
INSERT INTO "new_SolGroup" ("contributionPerMember", "createdAt", "currentCycle", "currentRecipientIndex", "groupName", "id", "nextCycleDate", "poolPerCycle", "status", "totalCycles", "updatedAt") SELECT "contributionPerMember", "createdAt", "currentCycle", "currentRecipientIndex", "groupName", "id", "nextCycleDate", "poolPerCycle", "status", "totalCycles", "updatedAt" FROM "SolGroup";
DROP TABLE "SolGroup";
ALTER TABLE "new_SolGroup" RENAME TO "SolGroup";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "PriceReport_userId_idx" ON "PriceReport"("userId");

-- CreateIndex
CREATE INDEX "PriceReport_commodityId_observedAt_idx" ON "PriceReport"("commodityId", "observedAt");

-- CreateIndex
CREATE INDEX "PriceReport_regionId_observedAt_idx" ON "PriceReport"("regionId", "observedAt");

-- CreateIndex
CREATE INDEX "PriceReport_market_idx" ON "PriceReport"("market");

-- CreateIndex
CREATE UNIQUE INDEX "UserConsent_userId_key" ON "UserConsent"("userId");

-- CreateIndex
CREATE INDEX "UserConsent_userId_idx" ON "UserConsent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PriceContribution_tradeId_key" ON "PriceContribution"("tradeId");

-- CreateIndex
CREATE UNIQUE INDEX "PriceContribution_priceReportId_key" ON "PriceContribution"("priceReportId");

-- CreateIndex
CREATE INDEX "PriceContribution_commodityId_observedAt_idx" ON "PriceContribution"("commodityId", "observedAt");

-- CreateIndex
CREATE INDEX "PriceContribution_regionId_observedAt_idx" ON "PriceContribution"("regionId", "observedAt");

-- CreateIndex
CREATE INDEX "PriceContribution_market_idx" ON "PriceContribution"("market");

-- CreateIndex
CREATE INDEX "PriceContribution_userId_idx" ON "PriceContribution"("userId");

-- CreateIndex
CREATE INDEX "GroupPriceSignal_commodityId_periodStart_idx" ON "GroupPriceSignal"("commodityId", "periodStart");

-- CreateIndex
CREATE INDEX "GroupPriceSignal_regionId_periodStart_idx" ON "GroupPriceSignal"("regionId", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "GroupPriceSignal_solGroupId_commodityId_market_periodStart_key" ON "GroupPriceSignal"("solGroupId", "commodityId", "market", "periodStart");

-- CreateIndex
CREATE INDEX "RegionalPriceSignal_commodityId_periodStart_idx" ON "RegionalPriceSignal"("commodityId", "periodStart");

-- CreateIndex
CREATE INDEX "RegionalPriceSignal_regionId_periodStart_idx" ON "RegionalPriceSignal"("regionId", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "RegionalPriceSignal_regionId_commodityId_periodStart_key" ON "RegionalPriceSignal"("regionId", "commodityId", "periodStart");

-- CreateIndex
CREATE INDEX "NationalPriceSignal_commodityId_periodStart_idx" ON "NationalPriceSignal"("commodityId", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "NationalPriceSignal_commodityId_periodStart_key" ON "NationalPriceSignal"("commodityId", "periodStart");

-- CreateIndex
CREATE INDEX "BusinessHealthSnapshot_userId_periodStart_idx" ON "BusinessHealthSnapshot"("userId", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessHealthSnapshot_userId_periodStart_periodType_key" ON "BusinessHealthSnapshot"("userId", "periodStart", "periodType");

-- CreateIndex
CREATE INDEX "PriceRecord_source_recordDate_idx" ON "PriceRecord"("source", "recordDate");

-- CreateIndex
CREATE INDEX "Trade_commodityId_date_idx" ON "Trade"("commodityId", "date");

-- CreateIndex
CREATE INDEX "Trade_marketBought_idx" ON "Trade"("marketBought");

-- CreateIndex
CREATE INDEX "Trade_marketSold_idx" ON "Trade"("marketSold");
