import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from './core/core.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AuthModule } from './modules/auth/auth.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { MpesaModule } from './modules/mpesa/mpesa.module';
import { SlipsModule } from './modules/slips/slips.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CoreModule,
    AuthModule,
    CampaignsModule,
    SlipsModule,
    AnalyticsModule,
    MpesaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
