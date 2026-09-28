import { randomBytes } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import {
  DarajaB2CRequest,
  DarajaB2CResponse,
  DarajaStkPushRequest,
  DarajaStkPushResponse,
  getDarajaBaseUrl,
} from './daraja.types';
import { DarajaConfigService } from './daraja.config';

const OAUTH_CACHE_KEY = 'daraja:oauth:access_token';
const OAUTH_CACHE_TTL_SECONDS = 3300;

@Injectable()
export class DarajaClient {
  private readonly logger = new Logger(DarajaClient.name);

  constructor(private readonly darajaConfig: DarajaConfigService) {}

  async initiateB2CPayment(
    request: DarajaB2CRequest,
  ): Promise<DarajaB2CResponse> {
    if (this.darajaConfig.config.mockMode) {
      this.logger.warn('Daraja mock mode — simulating B2C acceptance');
      return {
        ConversationID: `MOCK-CONV-${randomBytes(4).toString('hex')}`,
        OriginatorConversationID: request.OriginatorConversationID,
        ResponseCode: '0',
        ResponseDescription: 'Accept the service request successfully.',
      };
    }

    const token = await this.fetchAccessToken();
    const baseUrl = getDarajaBaseUrl(this.darajaConfig.config.environment);

    const response = await fetch(`${baseUrl}/mpesa/b2c/v3/paymentrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const body = (await response.json()) as DarajaB2CResponse & {
      errorMessage?: string;
    };

    if (!response.ok) {
      throw new Error(
        body.errorMessage ??
          body.ResponseDescription ??
          `Daraja B2C failed (${response.status})`,
      );
    }

    return body;
  }

  async initiateStkPush(
    request: DarajaStkPushRequest,
  ): Promise<DarajaStkPushResponse> {
    if (this.darajaConfig.config.mockMode) {
      this.logger.warn('Daraja mock mode — STK push not sent');
      return {
        MerchantRequestID: `MOCK-MER-${randomBytes(4).toString('hex')}`,
        CheckoutRequestID: `MOCK-CHK-${randomBytes(4).toString('hex')}`,
        ResponseCode: '0',
        ResponseDescription: 'Success. Request accepted for processing',
        CustomerMessage:
          'Mock STK push queued. Wire live credentials to send real prompts.',
      };
    }

    const token = await this.fetchAccessToken();
    const baseUrl = getDarajaBaseUrl(this.darajaConfig.config.environment);

    const response = await fetch(
      `${baseUrl}/mpesa/stkpush/v1/processrequest`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      },
    );

    const body = (await response.json()) as DarajaStkPushResponse & {
      errorMessage?: string;
    };

    if (!response.ok) {
      throw new Error(
        body.errorMessage ??
          body.ResponseDescription ??
          `Daraja STK push failed (${response.status})`,
      );
    }

    return body;
  }

  private async fetchAccessToken(): Promise<string> {
    const { consumerKey, consumerSecret } = this.darajaConfig.config;
    const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
      'base64',
    );
    const baseUrl = getDarajaBaseUrl(this.darajaConfig.config.environment);

    const response = await fetch(
      `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: { Authorization: `Basic ${credentials}` },
      },
    );

    const body = (await response.json()) as {
      access_token?: string;
      errorMessage?: string;
    };

    if (!response.ok || !body.access_token) {
      throw new Error(body.errorMessage ?? 'Failed to obtain Daraja OAuth token');
    }

    return body.access_token;
  }

  getOAuthCacheKey(): string {
    return OAUTH_CACHE_KEY;
  }

  getOAuthCacheTtlSeconds(): number {
    return OAUTH_CACHE_TTL_SECONDS;
  }
}
