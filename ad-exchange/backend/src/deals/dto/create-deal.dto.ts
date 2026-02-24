import { IsNumber, IsString, IsIn, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { SOCIAL_PLATFORMS, SocialPlatformKey } from '../../bloggers/dto/add-price-item.dto';

export class CreateDealDto {
  @IsNumber()
  @Type(() => Number)
  bloggerId: number;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  brief?: string;

  /** Full technical specification (ТЗ) from the issuer */
  @IsString()
  @IsOptional()
  tz?: string;

  /** Social channel/platform the placement will be on */
  @IsIn(SOCIAL_PLATFORMS)
  @IsOptional()
  socialPlatform?: SocialPlatformKey;

  /** Name of the format chosen from the blogger's price list */
  @IsString()
  @IsOptional()
  formatName?: string;

  @IsNumber()
  @Type(() => Number)
  amount: number;

  @IsIn(['RUB', 'USD', 'USDT'])
  currency: string;
}
