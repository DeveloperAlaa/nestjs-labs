import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

// swagger documentation
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @MaxLength(150)
  @IsNotEmpty()
  @IsString()
  username?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @MinLength(8)
  @IsNotEmpty()
  @IsString()
  password?: string;
}
