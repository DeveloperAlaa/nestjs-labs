import { IsString, IsNotEmpty, MinLength } from "class-validator";

export class ResetPasswordDto {
  @MinLength(8)
  @IsNotEmpty()
  @IsString()
  password!: string;

  @MinLength(8)
  @IsNotEmpty()
  @IsString()
  confirmPassword!: string;
}
