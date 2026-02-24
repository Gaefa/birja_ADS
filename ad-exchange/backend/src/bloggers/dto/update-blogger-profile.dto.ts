import { IsString, IsOptional } from 'class-validator';

export class UpdateBloggerProfileDto {
  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  niche?: string;

  @IsString()
  @IsOptional()
  geoCountry?: string;

  @IsString()
  @IsOptional()
  telegramContact?: string;
}
