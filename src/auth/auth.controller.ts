import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  ParseIntPipe,
  Render,
} from "@nestjs/common";

import { AuthService } from "./auth.service";

import { RegisterUserDto } from "./dtos/register-user.dto"; 
import { LoginUserDto } from "./dtos/login-user.dto";
import { EmailDto } from "./dtos/email.dto";
import { ResetPasswordDto } from "./dtos/reset-password";

@Controller("api/auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  // POST: ~/api/users/auth/register
  @Post("register")
  public async register(@Body() dto: RegisterUserDto) {
    return await this.authService.register(dto);
  }

  // POST: ~/api/users/auth/login
  @HttpCode(HttpStatus.OK)
  @Post("login")
  public async login(@Body() dto: LoginUserDto) {
    return await this.authService.login(dto);
  }

  // GET: ~/api/users/auth/verify/email/:userId/:verificationToken
  @Get("verify-email/:userId/:verificationToken")
  public async verifyEmail(
    @Param("userId", ParseIntPipe) userId: number,
    @Param("verificationToken") verificationToken: string,
  ) {
    return this.authService.verifyEmail(userId, verificationToken);
  }

  // POST ~/api/users/auth/reset-password
  @Post("reset-password")
  public requestPasswordReset(@Body() { email }: EmailDto) {
    return this.authService.requestPasswordReset(email);
  }

  // POST ~/api/users/auth/reset-password/:userId/:resetPasswordToken
  @Get("reset-password/:userId/:resetPasswordToken")
  @Render("reset-password")
  public async renderResetPasswordForm(
    @Param("userId", ParseIntPipe) userId: number,
    @Param("resetPasswordToken") resetPasswordToken: string,
  ) {
    return await this.authService.renderResetPasswordForm(
      userId,
      resetPasswordToken,
    );
  }

  // GET ~/api/users/auth/reset-password/:userId
  @Post("reset-password/:userId/:resetPasswordToken")
  public resetPassword(
    @Param("userId", ParseIntPipe) userId: number,
    @Param("resetPasswordToken") resetPasswordToken: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    console.log(resetPasswordDto);
    return this.authService.resetPassword(
      userId,
      resetPasswordToken,
      resetPasswordDto,
    );
  }
}
