-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('COMMISSION_INFLOW', 'WITHDRAWAL_OUTFLOW', 'REVERSAL');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'SUCCESSFUL', 'FAILED');

-- CreateEnum
CREATE TYPE "SlipType" AS ENUM ('SPORTS_SLIP', 'CRASH_SIGNAL');

-- CreateEnum
CREATE TYPE "SlipStatus" AS ENUM ('PENDING', 'WON', 'LOST', 'VOIDED');

-- CreateTable
CREATE TABLE "tipsters" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tipsters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "tipsterId" TEXT NOT NULL,
    "availableFunds" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "escrowFunds" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "mpesaReceiptNumber" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slips" (
    "id" TEXT NOT NULL,
    "tipsterId" TEXT NOT NULL,
    "type" "SlipType" NOT NULL DEFAULT 'SPORTS_SLIP',
    "slug" TEXT NOT NULL,
    "bookmaker" TEXT NOT NULL,
    "bookingCode" TEXT,
    "signalNotes" TEXT,
    "targetUrl" TEXT NOT NULL,
    "totalOdds" DECIMAL(8,2),
    "status" "SlipStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "slips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "click_logs" (
    "id" TEXT NOT NULL,
    "slipId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "click_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tipsters_phoneNumber_key" ON "tipsters"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "tipsters_username_key" ON "tipsters"("username");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_tipsterId_key" ON "wallets"("tipsterId");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_mpesaReceiptNumber_key" ON "transactions"("mpesaReceiptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "slips_slug_key" ON "slips"("slug");

-- CreateIndex
CREATE INDEX "slips_slug_idx" ON "slips"("slug");

-- CreateIndex
CREATE INDEX "click_logs_slipId_timestamp_idx" ON "click_logs"("slipId", "timestamp");

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_tipsterId_fkey" FOREIGN KEY ("tipsterId") REFERENCES "tipsters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slips" ADD CONSTRAINT "slips_tipsterId_fkey" FOREIGN KEY ("tipsterId") REFERENCES "tipsters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "click_logs" ADD CONSTRAINT "click_logs_slipId_fkey" FOREIGN KEY ("slipId") REFERENCES "slips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
