import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class LeaderboardQueryDto {
  @IsOptional()
  @IsIn(['7d', '30d', 'all'])
  period?: '7d' | '30d' | 'all' = '30d';

  @IsOptional()
  @IsIn(['clicks', 'conversions', 'earnings'])
  sortBy?: 'clicks' | 'conversions' | 'earnings' = 'clicks';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 25;
}
