import { IsString, IsNumber, IsOptional, IsIn, IsArray, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCampaignDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  brief?: string;

  @IsNumber()
  @Type(() => Number)
  budgetPerBlogger: number;

  @IsIn(['RUB', 'USD', 'USDT'])
  currency: string;

  @IsNumber()
  @Type(() => Number)
  bloggersNeeded: number;

  @IsDateString()
  deadline: string;

  @IsArray()
  @IsOptional()
  platforms?: string[];

  @IsOptional()
  isPrivate?: boolean;
}
