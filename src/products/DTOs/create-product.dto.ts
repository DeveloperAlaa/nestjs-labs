import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Min,
} from "class-validator";

export class CreateProductDTO {
  @IsNotEmpty()
  @IsString()
  //@ts-ignore
  name: string;

  @Min(0)
  @IsPositive()
  @IsNotEmpty()
  @IsNumber()
  //@ts-ignore
  price: number;
}
