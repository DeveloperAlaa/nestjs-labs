import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEmail,
  MinLength,
  IsOptional,
} from "class-validator";

// swagger documentation
import { ApiProperty } from "@nestjs/swagger";


export class RegisterUserDto {
  @ApiProperty()
  @IsOptional()
  @MaxLength(150)
  @IsNotEmpty()
  @IsString()
  username?: string;

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
