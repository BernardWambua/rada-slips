import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DarajaClient } from './daraja/daraja.client';
import { DarajaConfigService } from './daraja/daraja.config';
import { MpesaController } from './mpesa.controller';
import { MpesaService } from './mpesa.service';
import { MpesaWithdrawalsService } from './mpesa-withdrawals.service';

@Module({
  imports: [AuthModule],
  controllers: [MpesaController],
  providers: [
    DarajaConfigService,
    DarajaClient,
    MpesaService,
    MpesaWithdrawalsService,
  ],
  exports: [MpesaService, MpesaWithdrawalsService, DarajaConfigService],
})
export class MpesaModule {}
