import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  MinLength,
} from "class-validator";

export class UpdateProductDTO {
  @IsOptional()
  @Length(5, 150)
  @IsString()
  title?: string;

  @IsOptional()
  @IsNotEmpty()
  @MinLength(5)
  @IsString()
  description?: string;

  @IsOptional()
  @IsPositive()
  @IsNumber()
  price?: number;
}
