import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class UpdateDto {
  @IsOptional()
  @MaxLength(150)
  @IsNotEmpty()
  @IsString()
  username?: string;

  @IsOptional()
  @MinLength(8)
  @IsNotEmpty()
  @IsString()
  password?: string;
}
