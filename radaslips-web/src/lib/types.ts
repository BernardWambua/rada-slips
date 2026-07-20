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
  _count: { clicks: number; conversions: number };
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
  type: SlipType;
  bookingCode?: string;
  signalNotes?: string;
  targetUrl?: string;
  totalOdds?: number;
  slugPrefix?: string;
}
