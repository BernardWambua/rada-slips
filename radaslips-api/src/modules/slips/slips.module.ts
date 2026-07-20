import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SlipsController } from './slips.controller';
import { SlipsService } from './slips.service';

@Module({
  imports: [AuthModule],
  controllers: [SlipsController],
  providers: [SlipsService],
  exports: [SlipsService],
})
export class SlipsModule {}
