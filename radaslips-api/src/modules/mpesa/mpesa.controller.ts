import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentTipster } from '../../core/decorators/current-tipster.decorator';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RequestWithdrawalDto } from './dto/request-withdrawal.dto';
import { MpesaWithdrawalsService } from './mpesa-withdrawals.service';

@Controller('mpesa')
export class MpesaController {
  constructor(private readonly withdrawalsService: MpesaWithdrawalsService) {}

  @Get('status')
  getStatus() {
    return this.withdrawalsService.getIntegrationStatus();
  }

  @Get('withdrawals')
  @UseGuards(JwtAuthGuard)
  listWithdrawals(@CurrentTipster() tipster: { id: string }) {
    return this.withdrawalsService.listWithdrawals(tipster.id);
  }

  @Post('withdrawals')
  @UseGuards(JwtAuthGuard)
  requestWithdrawal(
    @CurrentTipster() tipster: { id: string },
    @Body() dto: RequestWithdrawalDto,
  ) {
    return this.withdrawalsService.requestWithdrawal(tipster.id, dto);
  }

  @Post('callbacks/b2c/result')
  handleB2CResult(@Body() payload: Record<string, unknown>) {
    return this.withdrawalsService.handleB2CResult(
      payload as unknown as Parameters<MpesaWithdrawalsService['handleB2CResult']>[0],
    );
  }

  @Post('callbacks/b2c/timeout')
  handleB2CTimeout(@Body() payload: Record<string, unknown>) {
    return this.withdrawalsService.handleB2CTimeout(
      payload as unknown as Parameters<MpesaWithdrawalsService['handleB2CTimeout']>[0],
    );
  }

  @Post('callbacks/stk')
  handleStkCallback(@Body() payload: Record<string, unknown>) {
    return {
      accepted: true,
      message:
        'STK callback received. Wire settlement logic when paybill goes live.',
      payload,
    };
  }
}
