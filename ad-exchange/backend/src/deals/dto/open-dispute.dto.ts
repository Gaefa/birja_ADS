import { IsString, IsIn } from 'class-validator';

export class OpenDisputeDto {
  @IsString()
  reason: string;

  @IsString()
  description: string;
}
