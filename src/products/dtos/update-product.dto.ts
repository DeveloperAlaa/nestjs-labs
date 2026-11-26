import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  MinLength,
} from "class-validator";

// swagger documentation
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateProductDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @Length(5, 150)
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @MinLength(5)
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsPositive()
  @IsNumber()
  price?: number;
}
