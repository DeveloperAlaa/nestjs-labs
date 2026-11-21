import { IsEmail, IsNotEmpty, MaxLength } from "class-validator";

export class EmailDto {
  @MaxLength(250)
  @IsNotEmpty()
  @IsEmail()
  email!: string;
}
