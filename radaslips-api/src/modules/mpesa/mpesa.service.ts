import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { toDarajaPhone } from '../../common/utils/phone.util';
import { DarajaClient } from './daraja/daraja.client';
import { DarajaConfigService } from './daraja/daraja.config';
import { DarajaStkPushRequest } from './daraja/daraja.types';

@Injectable()
export class MpesaService {
  constructor(
    private readonly darajaClient: DarajaClient,
    private readonly darajaConfig: DarajaConfigService,
  ) {}

  getStatus() {
    return this.darajaConfig.config;
  }

  buildStkPushPassword(shortCode: string, passKey: string, timestamp: string) {
    return createHash('sha256')
      .update(`${shortCode}${passKey}${timestamp}`)
      .digest('base64');
  }

  formatStkTimestamp(date = new Date()) {
    const pad = (value: number) => String(value).padStart(2, '0');
    return (
      `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
      `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
    );
  }

  async initiateStkPush(params: {
    phoneNumber: string;
    amount: number;
    accountReference: string;
    transactionDesc?: string;
  }) {
    const { config } = this.darajaConfig;
    const timestamp = this.formatStkTimestamp();
    const password = this.buildStkPushPassword(
      config.shortCode,
      config.passKey,
      timestamp,
    );
    const party = toDarajaPhone(params.phoneNumber);

    const payload: DarajaStkPushRequest = {
      BusinessShortCode: config.shortCode || '174379',
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: String(Math.round(params.amount)),
      PartyA: party,
      PartyB: config.shortCode || '174379',
      PhoneNumber: party,
      CallBackURL: config.stkCallbackUrl,
      AccountReference: params.accountReference,
      TransactionDesc: params.transactionDesc ?? 'RadaSlips payment',
    };

    return this.darajaClient.initiateStkPush(payload);
  }
}
