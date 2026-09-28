import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class RequestWithdrawalDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  idempotencyKey?: string;
}
