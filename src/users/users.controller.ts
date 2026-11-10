import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from "@nestjs/common";

import { UsersService } from "./users.service";
import { AuthGaurd } from "./gaurds/auth.gaurd";
import { UserPayload } from "./decorators/user-payload";

import { RegisterDto } from "./dtos/register.dto";
import { LoginDto } from "./dtos/login.dto";

import type { JWTPayload } from "../utils/types";

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

  @Get("profile")
  @UseGuards(AuthGaurd)
  public async getProfile(@UserPayload() payload: JWTPayload) {
    return await this.usersService.getProfile(payload.id);
  }
}
