import { IsEmail, IsNotEmpty, MaxLength } from "class-validator";

// swagger documentation
import { ApiProperty } from "@nestjs/swagger";

export class EmailDto {
  @ApiProperty()
  @MaxLength(250)
  @IsNotEmpty()
  @IsEmail()
  email!: string;
}
