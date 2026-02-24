import { IsEmail, IsString, IsIn, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsIn(['BLOGGER', 'ISSUER'])
  role: string;

  @IsString()
  name?: string;
}
