import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateIssuerProfileDto {
  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsIn(['BROKER', 'CRYPTO_EXCHANGE', 'DEFI', 'FUND', 'OTHER'])
  @IsOptional()
  companyType?: string;

  @IsString()
  @IsOptional()
  website?: string;
}
