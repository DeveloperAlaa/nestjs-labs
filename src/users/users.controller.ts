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
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Res,
  Render,
} from "@nestjs/common";

import { FileInterceptor } from "@nestjs/platform-express";

import type { Express, Response } from "express";

import { UsersService } from "./providers/users.service";
import { AuthGaurd } from "./guards/auth.guard";
import { UserPayload } from "./decorators/user-payload.decorator";

import { RegisterUserDto } from "./dtos/register-user.dto";
import { LoginUserDto } from "./dtos/login-user.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { EmailDto } from "./dtos/email.dto";
import { ResetPasswordDto } from "./dtos/reset-password";

import type { JWTPayload } from "../utils/types";
import { User } from "./user.entity";
import { AuthRoleGaurd } from "./guards/auth-role.guard";
import { UserRole } from "./decorators/user-role.decorator";
import { TUserRole } from "../utils/enums";

@Controller("/api/users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  // POST: ~/api/users/auth/register
  @Post("auth/register")
  public async register(@Body() dto: RegisterUserDto) {
    return await this.usersService.register(dto);
  }

  // POST: ~/api/users/auth/login
  @HttpCode(HttpStatus.OK)
  @Post("auth/login")
  public async login(@Body() dto: LoginUserDto) {
    return await this.usersService.login(dto);
  }

  // GET: ~/api/users/auth/verify/email/:userId/:verificationToken
  @Get("auth/verify/email/:userId/:verificationToken")
  public async verifyEmail(
    @Param("userId", ParseIntPipe) userId: number,
    @Param("verificationToken") verificationToken: string,
  ) {
    return this.usersService.verifyEmail(userId, verificationToken);
  }

  // GET: ~/api/users/profile
  // @UseInterceptors(PasswordInterceptor)
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
    @Body() dto: UpdateUserDto,
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

  // POST: ~/api/users/profile/image
  @Post("/profile/image")
  @UseGuards(AuthGaurd)
  @UseInterceptors(FileInterceptor("profile-image"))
  public addProfileImage(
    @UserPayload() payload: JWTPayload,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    if (!imageFile) throw new BadRequestException("no provided file ");
    return this.usersService.addProfileImage(payload.id, imageFile.filename);
  }

  // GET: ~/api/users/profile/image
  @Get("profile/image")
  @UseGuards(AuthGaurd)
  public async getProfileImage(
    @UserPayload() payload: JWTPayload,
    @Res() res: Response,
  ) {
    const user = await this.usersService.getProfile(payload.id);
    return res.sendFile(user.profileImage, { root: "./images/users" });
  }

  // DELETE: ~/api/users/profile/image
  @Delete("profile/image")
  @UseGuards(AuthGaurd)
  public removeProfileImage(@UserPayload() payload: JWTPayload) {
    return this.usersService.removeProfileImage(payload.id);
  }

  // POST ~/api/users/auth/reset-password
  @Post("auth/reset-password")
  public requestPasswordReset(@Body() {email}: EmailDto) {
   return this.usersService.requestPasswordReset(email);
  }

  // POST ~/api/users/auth/reset-password/:userId/:resetPasswordToken
  @Get("auth/reset-password/:userId/:resetPasswordToken")
  @Render("reset-password")
  public async renderResetPasswordForm(
    @Param("userId", ParseIntPipe) userId: number,
    @Param("resetPasswordToken") resetPasswordToken: string,
  ) {
    return await this.usersService.renderResetPasswordForm(
      userId,
      resetPasswordToken,
    );
  }

  // GET ~/api/users/auth/reset-password/:userId
  @Post("auth/reset-password/:userId/:resetPasswordToken")
  public resetPassword(
    @Param("userId", ParseIntPipe) userId: number,
    @Param("resetPasswordToken") resetPasswordToken: string,
    @Body() resetPasswordDto: ResetPasswordDto
  ) {
    console.log(resetPasswordDto)
    return this.usersService.resetPassword(userId, resetPasswordToken, resetPasswordDto)
  }
}
