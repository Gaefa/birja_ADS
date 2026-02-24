import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class AddPriceItemDto {
  @IsString()
  formatName: string;

  @IsString()
  @IsOptional()
  description?: string;

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
}
