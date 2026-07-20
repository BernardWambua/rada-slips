import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCampaignDto {
  @IsUUID()
  bookmakerId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}
