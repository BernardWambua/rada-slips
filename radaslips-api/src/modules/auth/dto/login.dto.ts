import { IsString, Matches, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @Matches(/^\+254[17]\d{8}$/, {
    message: 'phoneNumber must be a valid Kenyan number (+2547XXXXXXXX)',
  })
  phoneNumber: string;

  @IsString()
  @MinLength(8)
  password: string;
}
