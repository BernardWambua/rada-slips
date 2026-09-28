import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/client';
import { PrismaService } from '../../core/prisma.service';
import { RecordClickDto } from './dto/record-click.dto';
import { RecordConversionDto } from './dto/record-conversion.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async recordClick(slug: string, dto: RecordClickDto) {
    if (!dto.gatewayAccepted) {
      throw new BadRequestException('Gateway must be accepted to record click');
    }

    const slip = await this.prisma.slip.findUnique({ where: { slug } });

    if (!slip) {
      throw new NotFoundException('Slip not found');
    }

    const click = await this.prisma.clickLog.create({
      data: {
        slipId: slip.id,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
        gatewayAccepted: true,
      },
    });

    return {
      clickId: click.id,
      timestamp: click.timestamp,
    };
  }

  /**
   * Credits a tipster for a bet reported by the bookmaker. Not exposed over
   * HTTP yet: wire it to an admin import or a signed bookmaker postback.
   */
  async recordConversion(slug: string, dto: RecordConversionDto) {
    const slip = await this.prisma.slip.findUnique({
      where: { slug },
      include: {
        tipster: { include: { wallet: true } },
      },
    });

    if (!slip) {
      throw new NotFoundException('Slip not found');
    }

    const rate = await this.prisma.commissionRate.findUnique({
      where: { bookmakerId: slip.bookmakerId },
    });

    const betAmount = new Decimal(dto.betAmount);
    const commissionAmount =
      rate && rate.isActive && rate.betVolumeRate.gt(0)
        ? betAmount.mul(rate.betVolumeRate).mul(rate.tipsterShare)
        : new Decimal(0);

    const walletId = slip.tipster.wallet?.id;
    if (!walletId) {
      throw new NotFoundException('Tipster wallet not found');
    }

    const conversion = await this.prisma.$transaction(async (tx) => {
      const conversionLog = await tx.conversionLog.create({
        data: {
          slipId: slip.id,
          betAmount,
          externalRef: dto.externalRef,
          commissionAmount,
        },
      });

      if (commissionAmount.gt(0)) {
        await tx.wallet.update({
          where: { id: walletId },
          data: { availableFunds: { increment: commissionAmount } },
        });

        await tx.transaction.create({
          data: {
            walletId,
            amount: commissionAmount,
            type: 'COMMISSION_INFLOW',
            metadata: {
              source: 'conversion',
              slipId: slip.id,
              conversionId: conversionLog.id,
              slug,
              betAmount: dto.betAmount,
            },
          },
        });
      }

      return conversionLog;
    });

    return {
      conversionId: conversion.id,
      commissionAmount,
      timestamp: conversion.timestamp,
    };
  }

  async tipsterOverview(tipsterId: string) {
    const [slipCount, clickCount, conversionCount, wallet, recentSlips] =
      await Promise.all([
        this.prisma.slip.count({ where: { tipsterId } }),
        this.prisma.clickLog.count({
          where: { slip: { tipsterId }, gatewayAccepted: true },
        }),
        this.prisma.conversionLog.count({
          where: { slip: { tipsterId } },
        }),
        this.prisma.wallet.findUnique({ where: { tipsterId } }),
        this.prisma.slip.findMany({
          where: { tipsterId },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            bookmaker: { select: { name: true, slug: true } },
            _count: { select: { clicks: true, conversions: true } },
          },
        }),
      ]);

    const totalBetVolume = await this.prisma.conversionLog.aggregate({
      where: { slip: { tipsterId } },
      _sum: { betAmount: true },
    });

    return {
      slipCount,
      clickCount,
      conversionCount,
      totalBetVolume: totalBetVolume._sum.betAmount ?? new Decimal(0),
      wallet: wallet
        ? {
            availableFunds: wallet.availableFunds,
            escrowFunds: wallet.escrowFunds,
          }
        : null,
      recentSlips: recentSlips.map((slip) => ({
        id: slip.id,
        slug: slip.slug,
        bookmaker: slip.bookmaker,
        clicks: slip._count.clicks,
        conversions: slip._count.conversions,
        createdAt: slip.createdAt,
      })),
    };
  }

  async slipStats(tipsterId: string, slipId: string) {
    const slip = await this.prisma.slip.findUnique({
      where: { id: slipId },
      include: {
        _count: { select: { clicks: true, conversions: true } },
      },
    });

    if (!slip || slip.tipsterId !== tipsterId) {
      throw new NotFoundException('Slip not found');
    }

    const conversionTotals = await this.prisma.conversionLog.aggregate({
      where: { slipId },
      _sum: { commissionAmount: true, betAmount: true },
    });

    return {
      slipId: slip.id,
      slug: slip.slug,
      clicks: slip._count.clicks,
      conversions: slip._count.conversions,
      conversionCommission:
        conversionTotals._sum.commissionAmount ?? new Decimal(0),
      betVolume: conversionTotals._sum.betAmount ?? new Decimal(0),
    };
  }
}
