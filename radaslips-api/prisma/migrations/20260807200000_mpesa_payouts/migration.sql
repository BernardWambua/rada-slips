-- CreateEnum
CREATE TYPE "MpesaPayoutStatus" AS ENUM ('PENDING', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'REVERSED');

-- CreateTable
CREATE TABLE "mpesa_payouts" (
    "id" TEXT NOT NULL,
    "tipsterId" TEXT NOT NULL,
    "walletTransactionId" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "platformFee" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "netAmount" DECIMAL(12,2) NOT NULL,
    "status" "MpesaPayoutStatus" NOT NULL DEFAULT 'PENDING',
    "conversationId" TEXT,
    "originatorConversationId" TEXT,
    "mpesaReceiptNumber" TEXT,
    "resultCode" TEXT,
    "resultDesc" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mpesa_payouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mpesa_payouts_walletTransactionId_key" ON "mpesa_payouts"("walletTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "mpesa_payouts_conversationId_key" ON "mpesa_payouts"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "mpesa_payouts_originatorConversationId_key" ON "mpesa_payouts"("originatorConversationId");

-- CreateIndex
CREATE UNIQUE INDEX "mpesa_payouts_mpesaReceiptNumber_key" ON "mpesa_payouts"("mpesaReceiptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "mpesa_payouts_idempotencyKey_key" ON "mpesa_payouts"("idempotencyKey");

-- CreateIndex
CREATE INDEX "mpesa_payouts_tipsterId_createdAt_idx" ON "mpesa_payouts"("tipsterId", "createdAt");

-- AddForeignKey
ALTER TABLE "mpesa_payouts" ADD CONSTRAINT "mpesa_payouts_tipsterId_fkey" FOREIGN KEY ("tipsterId") REFERENCES "tipsters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mpesa_payouts" ADD CONSTRAINT "mpesa_payouts_walletTransactionId_fkey" FOREIGN KEY ("walletTransactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
