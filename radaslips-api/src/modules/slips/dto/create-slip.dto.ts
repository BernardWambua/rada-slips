import { SlipType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class CreateSlipDto {
  @IsUUID()
  bookmakerId: string;

  @IsOptional()
  @IsUUID()
  campaignId?: string;

  @IsOptional()
  @IsEnum(SlipType)
  type?: SlipType;

  @ValidateIf((dto: CreateSlipDto) => dto.type === SlipType.SPORTS_SLIP)
  @IsString()
  @IsNotEmpty()
  bookingCode?: string;

  @ValidateIf((dto: CreateSlipDto) => dto.type === SlipType.CRASH_SIGNAL)
  @IsString()
  @IsNotEmpty()
  signalNotes?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  targetUrl?: string;

  @IsOptional()
  @IsNumber()
  totalOdds?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  slugPrefix?: string;
}
