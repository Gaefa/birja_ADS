import { IsIn } from 'class-validator';

export class UpdateApplicationDto {
  @IsIn(['ACCEPTED', 'REJECTED'])
  status: string;
}
