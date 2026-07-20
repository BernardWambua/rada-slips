import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tipsterId: string, dto: CreateCampaignDto) {
    await this.ensureBookmakerExists(dto.bookmakerId);

    return this.prisma.campaign.create({
      data: {
        tipsterId,
        bookmakerId: dto.bookmakerId,
        title: dto.title,
        description: dto.description,
      },
      include: {
        bookmaker: { select: { slug: true, name: true } },
        _count: { select: { slips: true } },
      },
    });
  }

  async findAll(tipsterId: string) {
    return this.prisma.campaign.findMany({
      where: { tipsterId },
      orderBy: { createdAt: 'desc' },
      include: {
        bookmaker: { select: { slug: true, name: true } },
        _count: { select: { slips: true } },
      },
    });
  }

  async findOne(tipsterId: string, campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        bookmaker: true,
        slips: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            slug: true,
            type: true,
            status: true,
            createdAt: true,
            _count: { select: { clicks: true, conversions: true } },
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.tipsterId !== tipsterId) {
      throw new ForbiddenException('Not your campaign');
    }

    return campaign;
  }

  async update(
    tipsterId: string,
    campaignId: string,
    dto: UpdateCampaignDto,
  ) {
    await this.findOne(tipsterId, campaignId);

    return this.prisma.campaign.update({
      where: { id: campaignId },
      data: dto,
      include: {
        bookmaker: { select: { slug: true, name: true } },
        _count: { select: { slips: true } },
      },
    });
  }

  private async ensureBookmakerExists(bookmakerId: string) {
    const bookmaker = await this.prisma.bookmaker.findFirst({
      where: { id: bookmakerId, isActive: true },
    });

    if (!bookmaker) {
      throw new NotFoundException('Bookmaker not found');
    }
  }
}
