import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEmail,
  MinLength,
} from "class-validator";

// swagger documentation
import { ApiProperty } from "@nestjs/swagger";

export class LoginUserDto {
  @ApiProperty()
  @MaxLength(250)
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @MinLength(8)
  @IsNotEmpty()
  @IsString()
  password!: string;
}
