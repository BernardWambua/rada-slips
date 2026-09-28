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
  targetUrl: string;
  bookingCode: string | null;
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
  bookingCode: string | null;
  targetUrl: string;
  totalOdds: string | null;
  status: string;
  createdAt: string;
  shareUrl: string;
  bookmaker: { slug: string; name: string };
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
    bookmaker: { name: string; slug: string };
    clicks: number;
    conversions: number;
    createdAt: string;
  }>;
}

export interface CreateSlipPayload {
  bookmakerId: string;
  bookingCode: string;
  targetUrl?: string;
  totalOdds?: number;
  slugPrefix?: string;
}

