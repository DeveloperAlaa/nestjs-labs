import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
} from "class-validator";

export class UpdateProductDTO {
  @IsOptional()
  @Length(5, 150)
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsPositive()
  @IsNumber()
  price?: number;
}
