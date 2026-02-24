import { IsString, IsOptional, IsNumber, IsBoolean, IsIn } from 'class-validator';

export const SOCIAL_PLATFORMS = ['TELEGRAM', 'YOUTUBE', 'INSTAGRAM', 'TIKTOK', 'TWITTER', 'VK'] as const;
export type SocialPlatformKey = (typeof SOCIAL_PLATFORMS)[number];

export class AddPriceItemDto {
  @IsString()
  formatName: string;

  @IsString()
  @IsOptional()
  description?: string;

  /** Price in RUB; 0 or null means "по запросу" (Спецпроект) */
  @IsNumber()
  @IsOptional()
  priceRub?: number;

  @IsNumber()
  @IsOptional()
  priceUsd?: number;

  @IsNumber()
  @IsOptional()
  priceUsdt?: number;

  @IsNumber()
  @IsOptional()
  durationDays?: number;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  /** Platform this format is for; null = universal (shown for all platforms) */
  @IsIn(SOCIAL_PLATFORMS)
  @IsOptional()
  platform?: SocialPlatformKey;

  /** True for Спецпроект — price negotiated individually */
  @IsBoolean()
  @IsOptional()
  isSpecialProject?: boolean;
}
