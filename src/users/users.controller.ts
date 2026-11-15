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
} from "@nestjs/common";

import { FileInterceptor } from "@nestjs/platform-express";

import { diskStorage } from "multer";

import type { Express, Response } from "express";

import { UsersService } from "./providers/users.service";
import { AuthGaurd } from "./guards/auth.guard";
import { UserPayload } from "./decorators/user-payload.decorator";

import { RegisterUserDto } from "./dtos/register-user.dto";
import { LoginUserDto } from "./dtos/login-user.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";

import type { AccessToken, JWTPayload } from "../utils/types";
import { User } from "./user.entity";
import { AuthRoleGaurd } from "./guards/auth-role.guard";
import { UserRole } from "./decorators/user-role.decorator";
import { TUserRole } from "../utils/enums";

@Controller("/api/users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  // POST: ~/api/users/auth/register
  @Post("auth/register")
  public async register(@Body() dto: RegisterUserDto): Promise<AccessToken> {
    return await this.usersService.register(dto);
  }

  // POST: ~/api/users/auth/login
  @HttpCode(HttpStatus.OK)
  @Post("auth/login")
  public async login(@Body() dto: LoginUserDto): Promise<AccessToken> {
    return await this.usersService.login(dto);
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
  @UseInterceptors(
    FileInterceptor("profile-image", {
      storage: diskStorage({
        destination: "./images/users",
        filename: (req, file, callback) => {
          const filePrefix = `${Date.now()}${Math.round(Math.random() * 1_000_000)}`;
          const fileExtension = file.originalname.split(".").at(-1);
          const fileName = `${filePrefix}.${fileExtension}`;
          callback(null, fileName);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (file.mimetype.startsWith("image")) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException("onlt image formats are acceptable"),
            false,
          );
        }
      },
      limits: { fileSize: 1024 * 1024 * 5 },
    }),
  )
  public addProfileImage(
    @UserPayload() payload: JWTPayload,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    if (!imageFile) throw new BadRequestException("no provided file ");
    return this.usersService.addProfileImage(payload.id, imageFile.filename);
  }

  // GET: ~/api/users/profile/image
  @Get("profile/image/:imageName")
  @UseGuards(AuthGaurd)
  public async getProfileImage(
    @UserPayload() payload: JWTPayload,
    @Param("imageName") imageName: string,
    @Res() res: Response,
  ) {
    const user = await this.usersService.getProfile(payload.id);

    if (user.profileImage !== imageName)
      throw new BadRequestException("invalid profile image name");

    return res.sendFile(imageName, { root: "./images/users" });
  }

  // DELETE: ~/api/users/profile/image
  @Delete("profile/image")
  @UseGuards(AuthGaurd)
  public removeProfileImage(@UserPayload() payload: JWTPayload) {
    return this.usersService.removeProfileImage(payload.id);
  }
}
