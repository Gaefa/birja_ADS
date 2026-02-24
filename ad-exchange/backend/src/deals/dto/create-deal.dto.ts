import { IsNumber, IsString, IsIn, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDealDto {
  @IsNumber()
  @Type(() => Number)
  bloggerId: number;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  brief?: string;

  @IsNumber()
  @Type(() => Number)
  amount: number;

  @IsIn(['RUB', 'USD', 'USDT'])
  currency: string;
}
