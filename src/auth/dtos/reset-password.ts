import { IsString, IsNotEmpty, MinLength } from "class-validator";

// swagger documentation
import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordDto {
  @ApiProperty()
  @MinLength(8)
  @IsNotEmpty()
  @IsString()
  password!: string;

  @ApiProperty()
  @MinLength(8)
  @IsNotEmpty()
  @IsString()
  confirmPassword!: string;
}
