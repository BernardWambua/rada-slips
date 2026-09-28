import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';

export class CreateSlipDto {
  @IsUUID()
  bookmakerId: string;

  @IsString()
  @IsNotEmpty()
  bookingCode: string;

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
