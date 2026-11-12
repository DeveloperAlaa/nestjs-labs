import { IsNumber, IsString, Max, Min, MinLength } from "class-validator";

export class CreateReviewDto {
  @Max(5)
  @Min(1)
  @IsNumber()
  rating!: number;

  @MinLength(2)
  @IsString()
  comment!: string;
}
