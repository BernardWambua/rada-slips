import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { CurrentTipster } from '../../core/decorators/current-tipster.decorator';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { RecordClickDto } from './dto/record-click.dto';
import { RecordConversionDto } from './dto/record-conversion.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('clicks/:slug')
  recordClick(
    @Param('slug') slug: string,
    @Body() dto: RecordClickDto,
    @Req() req: Request,
  ) {
    return this.analyticsService.recordClick(slug, {
      ...dto,
      ipAddress: dto.ipAddress ?? req.ip,
      userAgent: dto.userAgent ?? req.headers['user-agent'],
    });
  }

  @Post('conversions/:slug')
  @UseGuards(JwtAuthGuard)
  recordConversion(
    @Param('slug') slug: string,
    @Body() dto: RecordConversionDto,
    @CurrentTipster() tipster: { id: string },
  ) {
    return this.analyticsService.recordConversion(slug, dto, tipster.id);
  }

  @Get('overview')
  @UseGuards(JwtAuthGuard)
  overview(@CurrentTipster() tipster: { id: string }) {
    return this.analyticsService.tipsterOverview(tipster.id);
  }

  @Get('slips/:slipId')
  @UseGuards(JwtAuthGuard)
  slipStats(
    @CurrentTipster() tipster: { id: string },
    @Param('slipId') slipId: string,
  ) {
    return this.analyticsService.slipStats(tipster.id, slipId);
  }
}
