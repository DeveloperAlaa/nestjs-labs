import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Res,
} from "@nestjs/common";

import { FileInterceptor } from "@nestjs/platform-express";

import type { Express, Response } from "express";

import { UsersService } from "./users.service";

import { UpdateUserDto } from "./dtos/update-user.dto";

import { AuthGaurd } from "../auth/guards/auth.guard";
import { AuthRoleGaurd } from "../auth/guards/auth-role.guard";

import { UserPayload } from "../auth/decorators/user-payload.decorator";

import type { JWTPayload } from "../common/types";
import { User } from "./user.entity";
import { UserRole } from "../auth/decorators/user-role.decorator";
import { TUserRole } from "../common/enums";

import { ApiBearerAuth } from "@nestjs/swagger";

@Controller("/api/users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  // GET: ~/api/users/profile
  @ApiBearerAuth()
  @UseGuards(AuthGaurd)
  @Get("profile")
  public async getProfile(@UserPayload() payload: JWTPayload): Promise<User> {
    return await this.usersService.getProfile(payload.id);
  }

  // GET: ~/api/users/
  @ApiBearerAuth()
  @UserRole(TUserRole.Admin)
  @UseGuards(AuthRoleGaurd)
  @Get()
  public getAllUsers(): Promise<Omit<User, "password">[]> {
    return this.usersService.getAll();
  }

  // PATCH: ~/api/users
  @ApiBearerAuth()
  @UserRole(TUserRole.Admin, TUserRole.User)
  @UseGuards(AuthRoleGaurd)
  @Patch()
  public updateUser(
    @Body() dto: UpdateUserDto,
    @UserPayload() payload: JWTPayload,
  ) {
    return this.usersService.update(payload.id, dto);
  }

  // DELETE: ~/api/users/:id
  @ApiBearerAuth()
  @UserRole(TUserRole.Admin, TUserRole.User)
  @UseGuards(AuthRoleGaurd)
  @Delete(":id")
  public deleteUser(
    @Param("id", ParseIntPipe) id: number,
    @UserPayload() payload: JWTPayload,
  ) {
    return this.usersService.delete(id, payload);
  }

  // POST: ~/api/users/profile/image
  @ApiBearerAuth()
  @UseGuards(AuthGaurd)
  @UseInterceptors(FileInterceptor("profile-image"))
  @Post("/profile/image")
  public addProfileImage(
    @UserPayload() payload: JWTPayload,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    if (!imageFile) throw new BadRequestException("no provided file ");
    return this.usersService.addProfileImage(payload.id, imageFile.filename);
  }

  // GET: ~/api/users/profile/image
  @ApiBearerAuth()
  @UseGuards(AuthGaurd)
  @Get("profile/image")
  public async getProfileImage(
    @UserPayload() payload: JWTPayload,
    @Res() res: Response,
  ) {
    const user = await this.usersService.getProfile(payload.id);
    return res.sendFile(user.profileImage, { root: "./images/users" });
  }

  // DELETE: ~/api/users/profile/image
  @ApiBearerAuth()
  @UseGuards(AuthGaurd)
  @Delete("profile/image")
  public removeProfileImage(@UserPayload() payload: JWTPayload) {
    return this.usersService.removeProfileImage(payload.id);
  }
}
