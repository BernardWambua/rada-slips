import { getToken } from './auth';
import type {
  AnalyticsOverview,
  AuthResponse,
  Bookmaker,
  CreateSlipPayload,
  MpesaIntegrationStatus,
  MpesaPayout,
  LeaderboardPeriod,
  LeaderboardResponse,
  LeaderboardSortBy,
  ResolvedSlip,
  Slip,
  Tipster,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = false,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (auth) {
    const token = getToken();
    if (!token) {
      throw new ApiError('Not authenticated', 401);
    }
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = (await response.json()) as { message?: string | string[] };
      if (body.message) {
        message = Array.isArray(body.message)
          ? body.message.join(', ')
          : body.message;
      }
    } catch {
      // ignore parse errors
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function resolveSlip(slug: string): Promise<ResolvedSlip> {
  return request<ResolvedSlip>(`/slips/resolve/${slug}`, { cache: 'no-store' });
}

export async function recordClick(slug: string): Promise<void> {
  await request(`/analytics/clicks/${slug}`, {
    method: 'POST',
    body: JSON.stringify({ gatewayAccepted: true }),
  });
}

export async function register(payload: {
  phoneNumber: string;
  password: string;
  displayName?: string;
}): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function login(payload: {
  phoneNumber: string;
  password: string;
}): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getMe(): Promise<Tipster> {
  return request<Tipster>('/auth/me', {}, true);
}

export async function listBookmakers(): Promise<Bookmaker[]> {
  return request<Bookmaker[]>('/slips/bookmakers');
}

export async function createSlip(payload: CreateSlipPayload): Promise<Slip> {
  return request<Slip>(
    '/slips',
    { method: 'POST', body: JSON.stringify(payload) },
    true,
  );
}

export async function listSlips(): Promise<Slip[]> {
  return request<Slip[]>('/slips', {}, true);
}

export async function getOverview(): Promise<AnalyticsOverview> {
  return request<AnalyticsOverview>('/analytics/overview', {}, true);
}

export async function getLeaderboard(params?: {
  period?: LeaderboardPeriod;
  sortBy?: LeaderboardSortBy;
  limit?: number;
}): Promise<LeaderboardResponse> {
  const search = new URLSearchParams();
  if (params?.period) search.set('period', params.period);
  if (params?.sortBy) search.set('sortBy', params.sortBy);
  if (params?.limit) search.set('limit', String(params.limit));

  const query = search.toString();
  return request<LeaderboardResponse>(
    `/analytics/leaderboard${query ? `?${query}` : ''}`,
    {},
    true,
  );
}

export async function getMpesaStatus(): Promise<MpesaIntegrationStatus> {
  return request<MpesaIntegrationStatus>('/mpesa/status');
}

export async function listMpesaWithdrawals(): Promise<MpesaPayout[]> {
  return request<MpesaPayout[]>('/mpesa/withdrawals', {}, true);
}

export async function requestMpesaWithdrawal(payload: {
  amount: number;
  phoneNumber?: string;
}): Promise<MpesaPayout> {
  return request<MpesaPayout>(
    '/mpesa/withdrawals',
    { method: 'POST', body: JSON.stringify(payload) },
    true,
  );
}

export function getApiUrl(): string {
  return API_URL;
}

export { ApiError };
