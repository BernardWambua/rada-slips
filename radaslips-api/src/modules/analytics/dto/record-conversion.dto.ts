import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class RecordConversionDto {
  @IsNumber()
  @Min(0.01)
  betAmount: number;

  @IsOptional()
  @IsString()
  externalRef?: string;
}
