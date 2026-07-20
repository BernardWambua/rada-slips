import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class RecordClickDto {
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsBoolean()
  gatewayAccepted: boolean;
}
