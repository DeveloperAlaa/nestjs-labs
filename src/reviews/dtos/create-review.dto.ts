import { IsNumber, IsString, Max, Min, MinLength } from "class-validator";

// swagger documentation
import { ApiProperty } from "@nestjs/swagger";

export class CreateReviewDto {
  @ApiProperty()
  @Max(5)
  @Min(1)
  @IsNumber()
  rating!: number;

  @ApiProperty()
  @MinLength(2)
  @IsString()
  comment!: string;
}
