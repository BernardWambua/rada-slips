import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/client';
import { randomUUID } from 'crypto';
import { toDarajaPhone } from '../../common/utils/phone.util';
import { PrismaService } from '../../core/prisma.service';
import { DarajaClient } from './daraja/daraja.client';
import { DarajaConfigService } from './daraja/daraja.config';
import {
  DarajaB2CResultCallback,
  DarajaB2CTimeoutCallback,
} from './daraja/daraja.types';
import { RequestWithdrawalDto } from './dto/request-withdrawal.dto';

@Injectable()
export class MpesaWithdrawalsService {
  private readonly logger = new Logger(MpesaWithdrawalsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly darajaClient: DarajaClient,
    private readonly darajaConfig: DarajaConfigService,
  ) {}

  getIntegrationStatus() {
    const { config } = this.darajaConfig;
    return {
      mode: config.mockMode ? 'mock' : 'live',
      environment: config.environment,
      b2cReady: this.darajaConfig.isConfiguredForLiveB2C(),
      stkReady:
        !config.mockMode &&
        !!config.consumerKey &&
        !!config.shortCode &&
        !!config.passKey,
      withdrawalMinAmount: config.withdrawalMinAmount,
      withdrawalFeeRate: config.withdrawalFeeRate,
      callbackUrls: {
        b2cResult: config.b2cResultUrl,
        b2cTimeout: config.b2cTimeoutUrl,
        stk: config.stkCallbackUrl,
      },
      notes: config.mockMode
        ? 'Mock mode is active until Daraja credentials and initiator details are configured.'
        : 'Live Daraja integration enabled.',
    };
  }

  async listWithdrawals(tipsterId: string) {
    return this.prisma.mpesaPayout.findMany({
      where: { tipsterId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async requestWithdrawal(tipsterId: string, dto: RequestWithdrawalDto) {
    const tipster = await this.prisma.tipster.findUniqueOrThrow({
      where: { id: tipsterId },
      include: { wallet: true },
    });

    if (!tipster.wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const amount = new Decimal(dto.amount);
    const minAmount = new Decimal(this.darajaConfig.config.withdrawalMinAmount);

    if (amount.lt(minAmount)) {
      throw new BadRequestException(
        `Minimum withdrawal is KES ${minAmount.toFixed(2)}`,
      );
    }

    const feeRate = new Decimal(this.darajaConfig.config.withdrawalFeeRate);
    const platformFee = amount.mul(feeRate).toDecimalPlaces(2);
    const netAmount = amount.minus(platformFee);

    if (netAmount.lte(0)) {
      throw new BadRequestException('Withdrawal amount is too small after fees');
    }

    if (tipster.wallet.availableFunds.lt(amount)) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    const payoutPhone = dto.phoneNumber ?? tipster.phoneNumber;
    const idempotencyKey = dto.idempotencyKey ?? randomUUID();
    const originatorConversationId = randomUUID();

    const existing = await this.prisma.mpesaPayout.findUnique({
      where: { idempotencyKey },
    });

    if (existing) {
      if (existing.tipsterId !== tipsterId) {
        throw new ConflictException('Duplicate withdrawal reference');
      }
      return existing;
    }

    const payout = await this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.update({
        where: { id: tipster.wallet!.id },
        data: {
          availableFunds: { decrement: amount },
          escrowFunds: { increment: amount },
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount: amount.mul(-1),
          type: 'WITHDRAWAL_OUTFLOW',
          status: 'PENDING',
          metadata: {
            channel: 'mpesa_b2c',
            phoneNumber: payoutPhone,
            platformFee: platformFee.toFixed(2),
            netAmount: netAmount.toFixed(2),
          },
        },
      });

      return tx.mpesaPayout.create({
        data: {
          tipsterId,
          walletTransactionId: transaction.id,
          phoneNumber: payoutPhone,
          amount,
          platformFee,
          netAmount,
          status: 'QUEUED',
          originatorConversationId,
          idempotencyKey,
          metadata: {
            mode: this.darajaConfig.config.mockMode ? 'mock' : 'live',
          },
        },
      });
    });

    try {
      const darajaResponse = await this.darajaClient.initiateB2CPayment({
        OriginatorConversationID: originatorConversationId,
        InitiatorName: this.darajaConfig.config.initiatorName || 'testapi',
        SecurityCredential:
          this.darajaConfig.config.securityCredential || 'mock-credential',
        CommandID: 'BusinessPayment',
        Amount: netAmount.toFixed(0),
        PartyA: this.darajaConfig.config.shortCode || '600000',
        PartyB: toDarajaPhone(payoutPhone),
        Remarks: 'RadaSlips tipster withdrawal',
        QueueTimeOutURL: this.darajaConfig.config.b2cTimeoutUrl,
        ResultURL: this.darajaConfig.config.b2cResultUrl,
        Occasion: 'Withdrawal',
      });

      const updated = await this.prisma.mpesaPayout.update({
        where: { id: payout.id },
        data: {
          status: 'PROCESSING',
          conversationId: darajaResponse.ConversationID,
          metadata: {
            ...(payout.metadata as object),
            darajaResponse,
          } as unknown as Prisma.InputJsonValue,
        },
      });

      if (this.darajaConfig.config.mockMode) {
        return this.completeMockPayout(updated.id, originatorConversationId);
      }

      return updated;
    } catch (error) {
      await this.reverseFailedPayout(
        payout.id,
        error instanceof Error ? error.message : 'Daraja request failed',
      );
      throw error;
    }
  }

  async handleB2CResult(payload: DarajaB2CResultCallback) {
    const result = payload.Result;
    const payout = await this.prisma.mpesaPayout.findFirst({
      where: {
        OR: [
          { originatorConversationId: result.OriginatorConversationID },
          { conversationId: result.ConversationID },
        ],
      },
      include: { walletTransaction: true },
    });

    if (!payout) {
      this.logger.warn(
        `B2C result received for unknown conversation ${result.ConversationID}`,
      );
      return { accepted: true };
    }

    if (payout.status === 'COMPLETED' || payout.status === 'FAILED') {
      return { accepted: true, payoutId: payout.id, status: payout.status };
    }

    if (result.ResultCode === 0) {
      const receipt =
        result.TransactionID ??
        this.extractResultParameter(result, 'TransactionReceipt');

      await this.markPayoutCompleted(payout.id, {
        mpesaReceiptNumber: receipt ? String(receipt) : undefined,
        resultCode: String(result.ResultCode),
        resultDesc: result.ResultDesc,
        rawCallback: payload,
      });
    } else {
      await this.reverseFailedPayout(
        payout.id,
        result.ResultDesc,
        String(result.ResultCode),
        payload,
      );
    }

    return { accepted: true, payoutId: payout.id };
  }

  async handleB2CTimeout(payload: DarajaB2CTimeoutCallback) {
    const result = payload.Result;
    const payout = await this.prisma.mpesaPayout.findFirst({
      where: {
        OR: [
          { originatorConversationId: result.OriginatorConversationID },
          { conversationId: result.ConversationID },
        ],
      },
    });

    if (!payout || payout.status === 'COMPLETED' || payout.status === 'FAILED') {
      return { accepted: true };
    }

    await this.reverseFailedPayout(
      payout.id,
      result.ResultDesc ?? 'Daraja queue timeout',
      String(result.ResultCode),
      payload,
    );

    return { accepted: true, payoutId: payout.id };
  }

  private async completeMockPayout(
    payoutId: string,
    originatorConversationId: string,
  ) {
    const mockReceipt = `MOCK${Date.now()}`;

    return this.markPayoutCompleted(payoutId, {
      mpesaReceiptNumber: mockReceipt,
      resultCode: '0',
      resultDesc: 'Mock B2C payout completed successfully.',
      rawCallback: {
        mock: true,
        originatorConversationId,
      },
    });
  }

  private async markPayoutCompleted(
    payoutId: string,
    details: {
      mpesaReceiptNumber?: string;
      resultCode?: string;
      resultDesc?: string;
      rawCallback?: unknown;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const payout = await tx.mpesaPayout.findUniqueOrThrow({
        where: { id: payoutId },
        include: { walletTransaction: true },
      });

      const updatedPayout = await tx.mpesaPayout.update({
        where: { id: payoutId },
        data: {
          status: 'COMPLETED',
          mpesaReceiptNumber: details.mpesaReceiptNumber,
          resultCode: details.resultCode,
          resultDesc: details.resultDesc,
          metadata: {
            ...(payout.metadata as object),
            callback: details.rawCallback,
          } as Prisma.InputJsonValue,
        },
      });

      if (payout.walletTransactionId) {
        await tx.transaction.update({
          where: { id: payout.walletTransactionId },
          data: {
            status: 'SUCCESSFUL',
            mpesaReceiptNumber: details.mpesaReceiptNumber,
          },
        });
      }

      const tipster = await tx.tipster.findUniqueOrThrow({
        where: { id: payout.tipsterId },
        include: { wallet: true },
      });

      if (tipster.wallet) {
        await tx.wallet.update({
          where: { id: tipster.wallet.id },
          data: {
            escrowFunds: { decrement: payout.amount },
          },
        });
      }

      return updatedPayout;
    });
  }

  private async reverseFailedPayout(
    payoutId: string,
    reason: string,
    resultCode?: string,
    rawCallback?: unknown,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const payout = await tx.mpesaPayout.findUniqueOrThrow({
        where: { id: payoutId },
      });

      if (payout.status === 'COMPLETED' || payout.status === 'REVERSED') {
        return payout;
      }

      const updatedPayout = await tx.mpesaPayout.update({
        where: { id: payoutId },
        data: {
          status: 'FAILED',
          resultCode,
          resultDesc: reason,
          metadata: {
            ...(payout.metadata as object),
            callback: rawCallback,
          } as Prisma.InputJsonValue,
        },
      });

      if (payout.walletTransactionId) {
        await tx.transaction.update({
          where: { id: payout.walletTransactionId },
          data: { status: 'FAILED' },
        });
      }

      const tipster = await tx.tipster.findUniqueOrThrow({
        where: { id: payout.tipsterId },
        include: { wallet: true },
      });

      if (tipster.wallet) {
        await tx.wallet.update({
          where: { id: tipster.wallet.id },
          data: {
            availableFunds: { increment: payout.amount },
            escrowFunds: { decrement: payout.amount },
          },
        });
      }

      return updatedPayout;
    });
  }

  private extractResultParameter(
    result: DarajaB2CResultCallback['Result'],
    key: string,
  ) {
    const parameters = result.ResultParameters?.ResultParameter ?? [];
    const match = parameters.find((item) => item.Key === key);
    return match?.Value;
  }
}
