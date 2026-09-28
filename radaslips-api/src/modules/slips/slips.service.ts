import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { generateSlug } from '../../common/utils/slug.util';
import { PrismaService } from '../../core/prisma.service';
import { RedisService } from '../../core/redis.service';
import { CreateSlipDto } from './dto/create-slip.dto';

const SLIP_CACHE_PREFIX = 'slip:resolve:';

@Injectable()
export class SlipsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async create(tipsterId: string, dto: CreateSlipDto) {
    const bookmaker = await this.prisma.bookmaker.findFirst({
      where: { id: dto.bookmakerId, isActive: true },
    });

    if (!bookmaker) {
      throw new NotFoundException('Bookmaker not found');
    }

    if (!dto.targetUrl && !bookmaker.urlTemplate) {
      throw new BadRequestException(
        'targetUrl is required when bookmaker has no URL template',
      );
    }

    const slug = generateSlug(dto.slugPrefix);
    const targetUrl = this.buildTargetUrl(
      bookmaker.websiteUrl,
      bookmaker.urlTemplate,
      dto.bookingCode,
      dto.targetUrl,
      slug,
    );

    const slip = await this.prisma.slip.create({
      data: {
        tipsterId,
        bookmakerId: bookmaker.id,
        slug,
        bookingCode: dto.bookingCode,
        targetUrl,
        totalOdds: dto.totalOdds,
      },
      include: {
        bookmaker: {
          select: {
            slug: true,
            name: true,
            licenseNumber: true,
            supportPhone: true,
          },
        },
        _count: { select: { clicks: true, conversions: true } },
      },
    });

    await this.cacheResolvedSlip(slip.slug);

    return {
      ...slip,
      shareUrl: this.buildShareUrl(slip.slug),
    };
  }

  async findAll(tipsterId: string) {
    const slips = await this.prisma.slip.findMany({
      where: { tipsterId },
      orderBy: { createdAt: 'desc' },
      include: {
        bookmaker: { select: { slug: true, name: true } },
        _count: { select: { clicks: true, conversions: true } },
      },
    });

    return slips.map((slip) => ({
      ...slip,
      shareUrl: this.buildShareUrl(slip.slug),
    }));
  }

  async findOne(tipsterId: string, slipId: string) {
    const slip = await this.prisma.slip.findUnique({
      where: { id: slipId },
      include: {
        bookmaker: true,
        _count: { select: { clicks: true, conversions: true } },
      },
    });

    if (!slip) {
      throw new NotFoundException('Slip not found');
    }

    if (slip.tipsterId !== tipsterId) {
      throw new ForbiddenException('Not your slip');
    }

    return {
      ...slip,
      shareUrl: this.buildShareUrl(slip.slug),
    };
  }

  async resolveBySlug(slug: string) {
    const cacheKey = `${SLIP_CACHE_PREFIX}${slug}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as Awaited<
        ReturnType<SlipsService['loadResolvedSlip']>
      >;
    }

    const resolved = await this.loadResolvedSlip(slug);
    await this.redis.set(cacheKey, JSON.stringify(resolved));
    return resolved;
  }

  async listBookmakers() {
    return this.prisma.bookmaker.findMany({
      where: { isActive: true, urlTemplate: { not: null } },
      select: {
        id: true,
        slug: true,
        name: true,
        websiteUrl: true,
        urlTemplate: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  private async loadResolvedSlip(slug: string) {
    const slip = await this.prisma.slip.findUnique({
      where: { slug },
      include: {
        bookmaker: {
          select: {
            name: true,
            slug: true,
            licenseNumber: true,
            supportPhone: true,
            websiteUrl: true,
          },
        },
      },
    });

    if (!slip) {
      throw new NotFoundException('Slip not found');
    }

    return {
      slug: slip.slug,
      targetUrl: slip.targetUrl,
      bookingCode: slip.bookingCode,
      totalOdds: slip.totalOdds,
      bookmaker: slip.bookmaker,
      compliance: {
        ageRequirement: 'Not for persons under 18 years of age.',
        responsibleGambling: 'Gambling is addictive! Play responsibly!',
        regulatoryStatus:
          'Authorized and regulated by the Betting Control and Licensing Board.',
        licenseNumber: slip.bookmaker.licenseNumber,
        supportPhone: slip.bookmaker.supportPhone,
      },
    };
  }

  private async cacheResolvedSlip(slug: string) {
    const resolved = await this.loadResolvedSlip(slug);
    await this.redis.set(`${SLIP_CACHE_PREFIX}${slug}`, JSON.stringify(resolved));
  }

  private buildTargetUrl(
    websiteUrl: string,
    urlTemplate: string | null,
    bookingCode: string,
    explicitTargetUrl: string | undefined,
    slug: string,
  ): string {
    let baseUrl: string;

    if (explicitTargetUrl) {
      baseUrl = explicitTargetUrl;
    } else if (urlTemplate) {
      baseUrl = urlTemplate.replace('{code}', bookingCode);
    } else {
      baseUrl = websiteUrl;
    }

    const url = new URL(baseUrl);
    url.searchParams.set('ref', 'radaslips');
    url.searchParams.set('slip', slug);
    return url.toString();
  }

  private buildShareUrl(slug: string) {
    const appUrl = process.env.APP_URL ?? 'http://localhost:3001';
    return `${appUrl.replace(/\/$/, '')}/r/${slug}`;
  }
}
