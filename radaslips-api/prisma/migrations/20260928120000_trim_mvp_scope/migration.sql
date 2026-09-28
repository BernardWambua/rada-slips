-- Remove crash-signal commission rates so bookmakerId can become unique
DELETE FROM "commission_rates" WHERE "slipType" = 'CRASH_SIGNAL';

-- DropForeignKey
ALTER TABLE "campaigns" DROP CONSTRAINT "campaigns_tipsterId_fkey";

-- DropForeignKey
ALTER TABLE "campaigns" DROP CONSTRAINT "campaigns_bookmakerId_fkey";

-- DropForeignKey
ALTER TABLE "mpesa_payouts" DROP CONSTRAINT "mpesa_payouts_tipsterId_fkey";

-- DropForeignKey
ALTER TABLE "mpesa_payouts" DROP CONSTRAINT "mpesa_payouts_walletTransactionId_fkey";

-- DropForeignKey
ALTER TABLE "slips" DROP CONSTRAINT "slips_campaignId_fkey";

-- DropIndex
DROP INDEX "commission_rates_bookmakerId_slipType_key";

-- AlterTable
ALTER TABLE "commission_rates" DROP COLUMN "perClickAmount",
DROP COLUMN "slipType";

-- AlterTable
ALTER TABLE "slips" DROP COLUMN "campaignId",
DROP COLUMN "signalNotes",
DROP COLUMN "type";

-- AlterTable
ALTER TABLE "click_logs" DROP COLUMN "commissionAmount";

-- DropTable
DROP TABLE "campaigns";

-- DropTable
DROP TABLE "mpesa_payouts";

-- DropEnum
DROP TYPE "CampaignStatus";

-- DropEnum
DROP TYPE "MpesaPayoutStatus";

-- DropEnum
DROP TYPE "SlipType";

-- CreateIndex
CREATE UNIQUE INDEX "commission_rates_bookmakerId_key" ON "commission_rates"("bookmakerId");

