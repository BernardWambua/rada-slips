import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentTipster } from '../../core/decorators/current-tipster.decorator';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  create(
    @CurrentTipster() tipster: { id: string },
    @Body() dto: CreateCampaignDto,
  ) {
    return this.campaignsService.create(tipster.id, dto);
  }

  @Get()
  findAll(@CurrentTipster() tipster: { id: string }) {
    return this.campaignsService.findAll(tipster.id);
  }

  @Get(':id')
  findOne(
    @CurrentTipster() tipster: { id: string },
    @Param('id') id: string,
  ) {
    return this.campaignsService.findOne(tipster.id, id);
  }

  @Patch(':id')
  update(
    @CurrentTipster() tipster: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.campaignsService.update(tipster.id, id, dto);
  }
}
