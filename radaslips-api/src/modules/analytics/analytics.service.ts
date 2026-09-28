import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/client';
import { PrismaService } from '../../core/prisma.service';
import { RecordClickDto } from './dto/record-click.dto';
import { RecordConversionDto } from './dto/record-conversion.dto';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';
import { tipsterPublicName } from '../../common/utils/tipster-display.util';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async recordClick(slug: string, dto: RecordClickDto) {
    if (!dto.gatewayAccepted) {
      throw new BadRequestException('Gateway must be accepted to record click');
    }

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
      where: {
        bookmakerId_slipType: {
          bookmakerId: slip.bookmakerId,
          slipType: slip.type,
        },
      },
    });

    const commissionAmount =
      rate && rate.isActive
        ? new Decimal(rate.perClickAmount).mul(rate.tipsterShare)
        : new Decimal(0);

    const walletId = slip.tipster.wallet?.id;
    if (!walletId) {
      throw new NotFoundException('Tipster wallet not found');
    }

    const click = await this.prisma.$transaction(async (tx) => {
      const clickLog = await tx.clickLog.create({
        data: {
          slipId: slip.id,
          ipAddress: dto.ipAddress,
          userAgent: dto.userAgent,
          gatewayAccepted: true,
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
              source: 'click',
              slipId: slip.id,
              clickId: clickLog.id,
              slug,
            },
          },
        });
      }

      return clickLog;
    });

    return {
      clickId: click.id,
      commissionAmount,
      timestamp: click.timestamp,
    };
  }

  async recordConversion(
    slug: string,
    dto: RecordConversionDto,
    tipsterId?: string,
  ) {
    const slip = await this.prisma.slip.findUnique({
      where: { slug },
      include: {
        tipster: { include: { wallet: true } },
      },
    });

    if (!slip) {
      throw new NotFoundException('Slip not found');
    }

    if (tipsterId && slip.tipsterId !== tipsterId) {
      throw new NotFoundException('Slip not found');
    }

    const rate = await this.prisma.commissionRate.findUnique({
      where: {
        bookmakerId_slipType: {
          bookmakerId: slip.bookmakerId,
          slipType: slip.type,
        },
      },
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
        type: slip.type,
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

    const [clickCommission, conversionCommission, betVolume] =
      await Promise.all([
        this.prisma.clickLog.aggregate({
          where: { slipId, gatewayAccepted: true },
          _sum: { commissionAmount: true },
        }),
        this.prisma.conversionLog.aggregate({
          where: { slipId },
          _sum: { commissionAmount: true, betAmount: true },
        }),
        this.prisma.conversionLog.aggregate({
          where: { slipId },
          _sum: { betAmount: true },
        }),
      ]);

    return {
      slipId: slip.id,
      slug: slip.slug,
      clicks: slip._count.clicks,
      conversions: slip._count.conversions,
      clickCommission: clickCommission._sum.commissionAmount ?? new Decimal(0),
      conversionCommission:
        conversionCommission._sum.commissionAmount ?? new Decimal(0),
      betVolume: betVolume._sum.betAmount ?? new Decimal(0),
    };
  }

  async getLeaderboard(
    query: LeaderboardQueryDto,
    viewerTipsterId?: string,
  ) {
    const period = query.period ?? '30d';
    const sortBy = query.sortBy ?? 'clicks';
    const limit = query.limit ?? 25;
    const since = this.leaderboardPeriodStart(period);

    const rows = await this.prisma.$queryRaw<
      Array<{
        tipsterId: string;
        displayName: string | null;
        phoneNumber: string;
        slipCount: number;
        clickCount: number;
        conversionCount: number;
        totalEarnings: string;
      }>
    >`
      SELECT
        t.id AS "tipsterId",
        t."displayName",
        t."phoneNumber",
        COUNT(DISTINCT s.id)::int AS "slipCount",
        COUNT(cl.id) FILTER (WHERE cl."gatewayAccepted" = true)::int AS "clickCount",
        COUNT(cv.id)::int AS "conversionCount",
        (
          COALESCE(SUM(cl."commissionAmount") FILTER (WHERE cl."gatewayAccepted" = true), 0)
          + COALESCE(SUM(cv."commissionAmount"), 0)
        )::text AS "totalEarnings"
      FROM tipsters t
      LEFT JOIN slips s ON s."tipsterId" = t.id
      LEFT JOIN click_logs cl ON cl."slipId" = s.id
        AND (${since}::timestamptz IS NULL OR cl."timestamp" >= ${since})
      LEFT JOIN conversion_logs cv ON cv."slipId" = s.id
        AND (${since}::timestamptz IS NULL OR cv."timestamp" >= ${since})
      WHERE t.status = 'ACTIVE'
      GROUP BY t.id, t."displayName", t."phoneNumber"
      HAVING
        COUNT(cl.id) FILTER (WHERE cl."gatewayAccepted" = true) > 0
        OR COUNT(cv.id) > 0
        OR COUNT(DISTINCT s.id) > 0
    `;

    const sorted = [...rows].sort((left, right) => {
      if (sortBy === 'conversions') {
        return right.conversionCount - left.conversionCount;
      }
      if (sortBy === 'earnings') {
        return Number(right.totalEarnings) - Number(left.totalEarnings);
      }
      return right.clickCount - left.clickCount;
    });

    const entries = sorted.slice(0, limit).map((row, index) => ({
      rank: index + 1,
      tipsterId: row.tipsterId,
      name: tipsterPublicName(row.displayName, row.phoneNumber),
      slipCount: row.slipCount,
      clickCount: row.clickCount,
      conversionCount: row.conversionCount,
      totalEarnings: row.totalEarnings,
    }));

    const viewerIndex = viewerTipsterId
      ? sorted.findIndex((row) => row.tipsterId === viewerTipsterId)
      : -1;

    const viewer =
      viewerIndex >= 0
        ? {
            rank: viewerIndex + 1,
            entry: {
              rank: viewerIndex + 1,
              tipsterId: sorted[viewerIndex].tipsterId,
              name: tipsterPublicName(
                sorted[viewerIndex].displayName,
                sorted[viewerIndex].phoneNumber,
              ),
              slipCount: sorted[viewerIndex].slipCount,
              clickCount: sorted[viewerIndex].clickCount,
              conversionCount: sorted[viewerIndex].conversionCount,
              totalEarnings: sorted[viewerIndex].totalEarnings,
            },
          }
        : null;

    return {
      period,
      sortBy,
      entries,
      viewer,
      updatedAt: new Date().toISOString(),
    };
  }

  private leaderboardPeriodStart(period: '7d' | '30d' | 'all') {
    if (period === 'all') {
      return null;
    }

    const days = period === '7d' ? 7 : 30;
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);
    return start;
  }
}
