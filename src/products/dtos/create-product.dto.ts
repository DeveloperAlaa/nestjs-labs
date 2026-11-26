import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Length,
  Min,
  MinLength,
} from "class-validator";

// swagger documentation
import { ApiProperty } from "@nestjs/swagger";

export class CreateProductDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(5, 150)
  title!: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(5)
  @IsString()
  description!: string;

  @ApiProperty()
  @Min(0)
  @IsPositive()
  @IsNotEmpty()
  @IsNumber()
  price!: number;
}
