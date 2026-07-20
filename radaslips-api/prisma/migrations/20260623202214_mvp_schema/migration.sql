/*
  Warnings:

  - You are about to drop the column `bookmaker` on the `slips` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `tipsters` table. All the data in the column will be lost.
  - Added the required column `bookmakerId` to the `slips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `tipsters` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');

-- DropIndex
DROP INDEX "tipsters_username_key";

-- AlterTable
ALTER TABLE "click_logs" ADD COLUMN     "commissionAmount" DECIMAL(12,4),
ADD COLUMN     "gatewayAccepted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "slips" DROP COLUMN "bookmaker",
ADD COLUMN     "bookmakerId" TEXT NOT NULL,
ADD COLUMN     "campaignId" TEXT;

-- AlterTable
ALTER TABLE "tipsters" DROP COLUMN "username",
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "passwordHash" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "status" SET DEFAULT 'SUCCESSFUL';

-- CreateTable
CREATE TABLE "bookmakers" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "supportPhone" TEXT NOT NULL,
    "urlTemplate" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "bookmakers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "tipsterId" TEXT NOT NULL,
    "bookmakerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "CampaignStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commission_rates" (
    "id" TEXT NOT NULL,
    "bookmakerId" TEXT,
    "slipType" "SlipType" NOT NULL,
    "perClickAmount" DECIMAL(10,4) NOT NULL DEFAULT 0.00,
    "betVolumeRate" DECIMAL(5,4) NOT NULL DEFAULT 0.00,
    "tipsterShare" DECIMAL(3,2) NOT NULL DEFAULT 0.70,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commission_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversion_logs" (
    "id" TEXT NOT NULL,
    "slipId" TEXT NOT NULL,
    "betAmount" DECIMAL(12,2) NOT NULL,
    "externalRef" TEXT,
    "commissionAmount" DECIMAL(12,4),
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversion_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bookmakers_slug_key" ON "bookmakers"("slug");

-- CreateIndex
CREATE INDEX "campaigns_tipsterId_idx" ON "campaigns"("tipsterId");

-- CreateIndex
CREATE UNIQUE INDEX "commission_rates_bookmakerId_slipType_key" ON "commission_rates"("bookmakerId", "slipType");

-- CreateIndex
CREATE INDEX "conversion_logs_slipId_timestamp_idx" ON "conversion_logs"("slipId", "timestamp");

-- CreateIndex
CREATE INDEX "slips_tipsterId_idx" ON "slips"("tipsterId");

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_tipsterId_fkey" FOREIGN KEY ("tipsterId") REFERENCES "tipsters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_bookmakerId_fkey" FOREIGN KEY ("bookmakerId") REFERENCES "bookmakers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_rates" ADD CONSTRAINT "commission_rates_bookmakerId_fkey" FOREIGN KEY ("bookmakerId") REFERENCES "bookmakers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slips" ADD CONSTRAINT "slips_bookmakerId_fkey" FOREIGN KEY ("bookmakerId") REFERENCES "bookmakers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slips" ADD CONSTRAINT "slips_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversion_logs" ADD CONSTRAINT "conversion_logs_slipId_fkey" FOREIGN KEY ("slipId") REFERENCES "slips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
