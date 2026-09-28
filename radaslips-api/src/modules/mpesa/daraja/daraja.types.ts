export type DarajaEnvironment = 'sandbox' | 'production';

export interface DarajaConfig {
  environment: DarajaEnvironment;
  consumerKey: string;
  consumerSecret: string;
  shortCode: string;
  passKey: string;
  initiatorName: string;
  securityCredential: string;
  b2cResultUrl: string;
  b2cTimeoutUrl: string;
  stkCallbackUrl: string;
  mockMode: boolean;
  withdrawalMinAmount: number;
  withdrawalFeeRate: number;
}

export interface DarajaOAuthResponse {
  access_token: string;
  expires_in: string;
}

export interface DarajaB2CRequest {
  OriginatorConversationID: string;
  InitiatorName: string;
  SecurityCredential: string;
  CommandID: 'BusinessPayment' | 'SalaryPayment' | 'PromotionPayment';
  Amount: string;
  PartyA: string;
  PartyB: string;
  Remarks: string;
  QueueTimeOutURL: string;
  ResultURL: string;
  Occasion: string;
}

export interface DarajaB2CResponse {
  ConversationID: string;
  OriginatorConversationID: string;
  ResponseCode: string;
  ResponseDescription: string;
}

export interface DarajaStkPushRequest {
  BusinessShortCode: string;
  Password: string;
  Timestamp: string;
  TransactionType: 'CustomerPayBillOnline';
  Amount: string;
  PartyA: string;
  PartyB: string;
  PhoneNumber: string;
  CallBackURL: string;
  AccountReference: string;
  TransactionDesc: string;
}

export interface DarajaStkPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface DarajaB2CResultCallback {
  Result: {
    ResultType: number;
    ResultCode: number;
    ResultDesc: string;
    OriginatorConversationID: string;
    ConversationID: string;
    TransactionID?: string;
    ResultParameters?: {
      ResultParameter: Array<{
        Key: string;
        Value: string | number;
      }>;
    };
  };
}

export interface DarajaB2CTimeoutCallback {
  Result: {
    ResultType: number;
    ResultCode: number;
    ResultDesc: string;
    OriginatorConversationID: string;
    ConversationID: string;
  };
}

export function getDarajaBaseUrl(environment: DarajaEnvironment): string {
  return environment === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';
}
