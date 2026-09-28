import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DarajaConfig,
  DarajaEnvironment,
} from './daraja.types';

@Injectable()
export class DarajaConfigService {
  readonly config: DarajaConfig;

  constructor(private readonly configService: ConfigService) {
    const environment =
      (this.configService.get<string>('DARAJA_ENVIRONMENT') ??
        'sandbox') as DarajaEnvironment;

    const consumerKey =
      this.configService.get<string>('DARAJA_CONSUMER_KEY') ?? '';
    const consumerSecret =
      this.configService.get<string>('DARAJA_CONSUMER_SECRET') ?? '';

    const mockModeExplicit =
      this.configService.get<string>('DARAJA_MOCK_MODE') === 'true';
    const mockMode =
      mockModeExplicit ||
      !consumerKey ||
      !consumerSecret ||
      !this.configService.get<string>('DARAJA_INITIATOR_NAME') ||
      !this.configService.get<string>('DARAJA_SECURITY_CREDENTIAL');

    const callbackBase = (
      this.configService.get<string>('DARAJA_CALLBACK_BASE_URL') ??
      this.configService.get<string>('API_PUBLIC_URL') ??
      `http://localhost:${this.configService.get<string>('PORT') ?? '5000'}`
    ).replace(/\/$/, '');

    this.config = {
      environment,
      consumerKey,
      consumerSecret,
      shortCode: this.configService.get<string>('DARAJA_SHORT_CODE') ?? '',
      passKey: this.configService.get<string>('DARAJA_PASS_KEY') ?? '',
      initiatorName:
        this.configService.get<string>('DARAJA_INITIATOR_NAME') ?? '',
      securityCredential:
        this.configService.get<string>('DARAJA_SECURITY_CREDENTIAL') ?? '',
      b2cResultUrl:
        this.configService.get<string>('DARAJA_B2C_RESULT_URL') ??
        `${callbackBase}/mpesa/callbacks/b2c/result`,
      b2cTimeoutUrl:
        this.configService.get<string>('DARAJA_B2C_TIMEOUT_URL') ??
        `${callbackBase}/mpesa/callbacks/b2c/timeout`,
      stkCallbackUrl:
        this.configService.get<string>('DARAJA_STK_CALLBACK_URL') ??
        `${callbackBase}/mpesa/callbacks/stk`,
      mockMode,
      withdrawalMinAmount: Number(
        this.configService.get<string>('DARAJA_WITHDRAWAL_MIN_AMOUNT') ?? '10',
      ),
      withdrawalFeeRate: Number(
        this.configService.get<string>('DARAJA_WITHDRAWAL_FEE_RATE') ?? '0.01',
      ),
    };
  }

  isConfiguredForLiveB2C(): boolean {
    const { config } = this;
    return (
      !config.mockMode &&
      !!config.consumerKey &&
      !!config.consumerSecret &&
      !!config.shortCode &&
      !!config.initiatorName &&
      !!config.securityCredential
    );
  }
}
