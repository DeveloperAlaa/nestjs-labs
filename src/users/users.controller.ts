import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
} from "@nestjs/common";

import { UsersService } from "./users.service";
import { AuthGaurd } from "./gaurds/auth.gaurd";
import { UserPayload } from "./decorators/user-payload.decorator";

import { RegisterDto } from "./dtos/register.dto";
import { LoginDto } from "./dtos/login.dto";
import { UpdateDto } from "./dtos/update.dto";

import type { AccessToken, JWTPayload } from "../utils/types";
import { User } from "./user.entity";
import { AuthRoleGaurd } from "./gaurds/auth-role.guard";
import { UserRole } from "./decorators/user-role.decorator";
import { TUserRole } from "../utils/enums";

@Controller("/api/users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  // POST: ~/api/users/auth/register
  @Post("auth/register")
  public async register(@Body() dto: RegisterDto): Promise<AccessToken> {
    return await this.usersService.register(dto);
  }

  // POST: ~/api/users/auth/login
  @HttpCode(HttpStatus.OK)
  @Post("auth/login")
  public async login(@Body() dto: LoginDto): Promise<AccessToken> {
    return await this.usersService.login(dto);
  }

  // GET: ~/api/users/profile
  @Get("profile")
  @UseGuards(AuthGaurd)
  public async getProfile(@UserPayload() payload: JWTPayload): Promise<User> {
    return await this.usersService.getProfile(payload.id);
  }

  // GET: ~/api/users/
  @Get()
  @UserRole(TUserRole.Admin)
  @UseGuards(AuthRoleGaurd)
  public getAllUsers(): Promise<Omit<User, "password">[]> {
    return this.usersService.getAll();
  }

  // PATCH: ~/api/users
  @Patch()
  @UserRole(TUserRole.Admin, TUserRole.User)
  @UseGuards(AuthRoleGaurd)
  public updateUser(
    @Body() dto: UpdateDto,
    @UserPayload() payload: JWTPayload,
  ) {
    return this.usersService.update(payload.id, dto);
  }

  // DELETE: ~/api/users
  @Delete(":id")
  @UserRole(TUserRole.Admin, TUserRole.User)
  @UseGuards(AuthRoleGaurd)
  public deleteUser(
    @Param("id", ParseIntPipe) id: number,
    @UserPayload() payload: JWTPayload,
  ) {
    return this.usersService.delete(id, payload);
  }
}
