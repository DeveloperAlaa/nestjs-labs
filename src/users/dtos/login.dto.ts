import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEmail,
  MinLength,
} from "class-validator";

export class LoginDto {
  @MaxLength(250)
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @MinLength(8)
  @IsNotEmpty()
  @IsString()
  password!: string;
}
