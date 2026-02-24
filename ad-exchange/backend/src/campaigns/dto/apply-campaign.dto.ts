import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ApplyCampaignDto {
  @IsString()
  @IsOptional()
  pitch?: string;

  @IsNumber()
  @Type(() => Number)
  proposedPrice: number;
}
