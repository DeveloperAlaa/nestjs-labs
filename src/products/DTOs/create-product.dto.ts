import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Length,
  Min,
  MinLength,
} from "class-validator";

export class CreateProductDTO {
  @IsNotEmpty()
  @IsString()
  @Length(5, 150)
  title!: string;

  @IsNotEmpty()
  @MinLength(5)
  @IsString()
  description!: string;

  @Min(0)
  @IsPositive()
  @IsNotEmpty()
  @IsNumber()
  price!: number;
}
