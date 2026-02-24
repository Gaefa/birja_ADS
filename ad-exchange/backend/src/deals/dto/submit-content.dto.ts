import { IsString } from 'class-validator';

export class SubmitContentDto {
  @IsString()
  contentUrl: string;
}
