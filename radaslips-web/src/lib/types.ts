export type SlipType = 'SPORTS_SLIP' | 'CRASH_SIGNAL';

export interface Bookmaker {
  id: string;
  slug: string;
  name: string;
  websiteUrl: string;
  urlTemplate: string | null;
}

export interface ComplianceInfo {
  ageRequirement: string;
  responsibleGambling: string;
  regulatoryStatus: string;
  licenseNumber: string;
  supportPhone: string;
}

export interface ResolvedSlip {
  slug: string;
  type: SlipType;
  targetUrl: string;
  bookingCode: string | null;
  signalNotes: string | null;
  totalOdds: string | null;
  bookmaker: {
    name: string;
    slug: string;
    licenseNumber: string;
    supportPhone: string;
    websiteUrl: string;
  };
  compliance: ComplianceInfo;
}

export interface Tipster {
  id: string;
  phoneNumber: string;
  displayName: string | null;
  status: string;
  createdAt: string;
  wallet?: {
    availableFunds: string;
    escrowFunds: string;
  };
}

export interface AuthResponse {
  tipster: Tipster;
  accessToken: string;
}

export interface Slip {
  id: string;
  slug: string;
  type: SlipType;
  bookingCode: string | null;
  signalNotes: string | null;
  targetUrl: string;
  totalOdds: string | null;
  status: string;
  createdAt: string;
  shareUrl: string;
  bookmaker: { slug: string; name: string };
  campaign: { id: string; title: string } | null;
  _count?: { clicks: number; conversions: number };
}

export interface AnalyticsOverview {
  slipCount: number;
  clickCount: number;
  conversionCount: number;
  totalBetVolume: string;
  wallet: { availableFunds: string; escrowFunds: string } | null;
  recentSlips: Array<{
    id: string;
    slug: string;
    type: SlipType;
    bookmaker: { name: string; slug: string };
    clicks: number;
    conversions: number;
    createdAt: string;
  }>;
}

export interface CreateSlipPayload {
  bookmakerId: string;
  type?: SlipType;
  bookingCode: string;
  targetUrl?: string;
  totalOdds?: number;
  slugPrefix?: string;
}

export type MpesaPayoutStatus =
  | 'PENDING'
  | 'QUEUED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REVERSED';

export interface MpesaPayout {
  id: string;
  phoneNumber: string;
  amount: string;
  platformFee: string;
  netAmount: string;
  status: MpesaPayoutStatus;
  mpesaReceiptNumber: string | null;
  resultDesc: string | null;
  createdAt: string;
}

export interface MpesaIntegrationStatus {
  mode: 'mock' | 'live';
  environment: string;
  b2cReady: boolean;
  stkReady: boolean;
  withdrawalMinAmount: number;
  withdrawalFeeRate: number;
  notes: string;
}

export type LeaderboardPeriod = '7d' | '30d' | 'all';
export type LeaderboardSortBy = 'clicks' | 'conversions' | 'earnings';

export interface LeaderboardEntry {
  rank: number;
  tipsterId: string;
  name: string;
  slipCount: number;
  clickCount: number;
  conversionCount: number;
  totalEarnings: string;
}

export interface LeaderboardResponse {
  period: LeaderboardPeriod;
  sortBy: LeaderboardSortBy;
  entries: LeaderboardEntry[];
  viewer: {
    rank: number;
    entry: LeaderboardEntry;
  } | null;
  updatedAt: string;
}
