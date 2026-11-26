import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from "class-validator";

// swagger documentation
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateReviewDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Max(5)
  @Min(1)
  @IsNumber()
  rating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @MinLength(2)
  @IsString()
  comment?: string;
}
