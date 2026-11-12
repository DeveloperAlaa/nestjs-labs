import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from "class-validator";

export class UpdateReviewDto {
  @IsOptional()
  @Max(5)
  @Min(1)
  @IsNumber()
  rating?: number;

  @IsOptional()
  @MinLength(2)
  @IsString()
  comment!: string;
}
