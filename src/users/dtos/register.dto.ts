import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEmail,
  MinLength,
  IsOptional,
} from "class-validator";

export class RegisterDto {
  @IsOptional()
  @MaxLength(150)
  @IsNotEmpty()
  @IsString()
  username?: string;

  @MaxLength(250)
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @MinLength(8)
  @IsNotEmpty()
  @IsString()
  password!: string;
}
