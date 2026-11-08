import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { UsersService } from "./users.service";
import { RegisterDto } from "./DTOs/register.dto";
import { LoginDto } from "./DTOs/login.dto";

@Controller("/api/users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post("auth/register")
  public async register(@Body() dto: RegisterDto) {
    return await this.usersService.register(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post("auth/login")
  public async login(@Body() dto: LoginDto) {
    return await this.usersService.login(dto);
  }
}
