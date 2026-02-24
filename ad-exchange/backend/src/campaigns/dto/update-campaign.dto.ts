import { IsString, IsNumber, IsOptional, IsIn, IsArray, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCampaignDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  brief?: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  budgetPerBlogger?: number;

  @IsIn(['RUB', 'USD', 'USDT'])
  @IsOptional()
  currency?: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  bloggersNeeded?: number;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsArray()
  @IsOptional()
  platforms?: string[];

  @IsIn(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'])
  @IsOptional()
  status?: string;
}
