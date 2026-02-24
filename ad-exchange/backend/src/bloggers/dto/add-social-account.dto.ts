import { IsString, IsOptional, IsNumber, IsIn } from 'class-validator';

export class AddSocialAccountDto {
  @IsIn(['TELEGRAM', 'YOUTUBE', 'INSTAGRAM', 'TIKTOK', 'TWITTER'])
  platform: string;

  @IsString()
  username: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsNumber()
  @IsOptional()
  followersCount?: number;

  @IsNumber()
  @IsOptional()
  avgViews?: number;

  @IsNumber()
  @IsOptional()
  engagementRate?: number;
}
