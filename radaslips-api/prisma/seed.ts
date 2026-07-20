import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, SlipType } from '@prisma/client';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const BOOKMAKERS = [
  {
    slug: 'BETIKA',
    name: 'Betika',
    websiteUrl: 'https://www.betika.com/en-ke/',
    licenseNumber: '0000451',
    supportPhone: '+254708888888',
    urlTemplate: 'https://www.betika.com/en-ke/share/{code}',
  },
  {
    slug: 'BETKUMI',
    name: 'Betkumi',
    websiteUrl: 'https://www.betkumi.com/',
    licenseNumber: '0000000',
    supportPhone: '+254700000000',
    urlTemplate: null,
  },
  {
    slug: 'SPORTPESA',
    name: 'SportPesa Kenya',
    websiteUrl: 'https://www.ke.sportpesa.com/en/sports-betting/football-1/',
    licenseNumber: '0000417',
    supportPhone: '+254727776666',
    urlTemplate: 'https://www.ke.sportpesa.com/share/{code}',
  },
] as const;

const COMMISSION_RATES: Array<{
  bookmakerSlug: string;
  slipType: SlipType;
  perClickAmount: number;
  betVolumeRate: number;
}> = [
  {
    bookmakerSlug: 'BETKUMI',
    slipType: SlipType.CRASH_SIGNAL,
    perClickAmount: 0.5,
    betVolumeRate: 0,
  },
  {
    bookmakerSlug: 'BETIKA',
    slipType: SlipType.SPORTS_SLIP,
    perClickAmount: 0.1,
    betVolumeRate: 0.02,
  },
  {
    bookmakerSlug: 'SPORTPESA',
    slipType: SlipType.SPORTS_SLIP,
    perClickAmount: 0.1,
    betVolumeRate: 0.02,
  },
];

async function main() {
  for (const bookmaker of BOOKMAKERS) {
    await prisma.bookmaker.upsert({
      where: { slug: bookmaker.slug },
      create: bookmaker,
      update: {
        name: bookmaker.name,
        websiteUrl: bookmaker.websiteUrl,
        licenseNumber: bookmaker.licenseNumber,
        supportPhone: bookmaker.supportPhone,
        urlTemplate: bookmaker.urlTemplate,
        isActive: true,
      },
    });
  }

  for (const rate of COMMISSION_RATES) {
    const bookmaker = await prisma.bookmaker.findUniqueOrThrow({
      where: { slug: rate.bookmakerSlug },
    });

    await prisma.commissionRate.upsert({
      where: {
        bookmakerId_slipType: {
          bookmakerId: bookmaker.id,
          slipType: rate.slipType,
        },
      },
      create: {
        bookmakerId: bookmaker.id,
        slipType: rate.slipType,
        perClickAmount: rate.perClickAmount,
        betVolumeRate: rate.betVolumeRate,
        tipsterShare: 0.7,
      },
      update: {
        perClickAmount: rate.perClickAmount,
        betVolumeRate: rate.betVolumeRate,
        isActive: true,
      },
    });
  }

  console.log('Seeded bookmakers and commission rates.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
