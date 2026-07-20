import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentTipster } from '../../core/decorators/current-tipster.decorator';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { CreateSlipDto } from './dto/create-slip.dto';
import { SlipsService } from './slips.service';

@Controller('slips')
export class SlipsController {
  constructor(private readonly slipsService: SlipsService) {}

  @Get('bookmakers')
  listBookmakers() {
    return this.slipsService.listBookmakers();
  }

  @Get('resolve/:slug')
  resolve(@Param('slug') slug: string) {
    return this.slipsService.resolveBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentTipster() tipster: { id: string },
    @Body() dto: CreateSlipDto,
  ) {
    return this.slipsService.create(tipster.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentTipster() tipster: { id: string }) {
    return this.slipsService.findAll(tipster.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(
    @CurrentTipster() tipster: { id: string },
    @Param('id') id: string,
  ) {
    return this.slipsService.findOne(tipster.id, id);
  }
}
