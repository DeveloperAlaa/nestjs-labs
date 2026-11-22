import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { JwtService } from "@nestjs/jwt";
import { Repository } from "typeorm";
import * as bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

import { User } from "../users/user.entity";

import { RegisterUserDto } from "./dtos/register-user.dto"; 
import { LoginUserDto } from "../users/dtos/login-user.dto";
import { ResetPasswordDto } from "./dtos/reset-password"; 

import { MailService } from "../mail/mail.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailservice: MailService,
    private readonly config: ConfigService,
  ) {}

  public async register(dto: RegisterUserDto) {
    const { username, email, password } = dto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (user) throw new BadRequestException("Invalid Credintials.");

    const hashedPassword = await this.hashPassword(password);

    let newUser = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      verificationToken: randomBytes(32).toString("hex"),
    });
    newUser = await this.userRepository.save(newUser);

    const verificationLink = this.generateVerificationLink(
      newUser.id,
      newUser.verificationToken,
    );

    await this.mailservice.sendRegisterEmail(email, verificationLink);

    return {
      message:
        "Registered successfully. A verification email will be sent to you",
    };
  }

  public async login(dto: LoginUserDto) {
    const { email, password } = dto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new BadRequestException("Invalid email or password.");

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch)
      throw new BadRequestException("Invalid email or password.");

    if (!user.isAccountVerified) {
      if (!user.verificationToken) {
        user.verificationToken = randomBytes(32).toString("hex");
        await this.userRepository.save(user);
      }

      const verificationLink = this.generateVerificationLink(
        user.id,
        user.verificationToken,
      );
      await this.mailservice.sendRegisterEmail(email, verificationLink);
      return {
        message:
          "A verification email will be sent to you, verify your email to be able to log in.",
      };
    }

    const accessToken = await this.jwtService.signAsync({
      id: user.id,
      role: user.userRole,
    });
    return { accessToken };
  }

  public async verifyEmail(userId: number, verificationToken: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) throw new BadRequestException("invalid verification link");

    if (user.verificationToken === null)
      throw new BadRequestException("invalid verification link");

    if (user.verificationToken !== verificationToken)
      throw new BadRequestException("invalid verification link");

    Object.assign(user, { verificationToken: null });
    user.isAccountVerified = true;
    await this.userRepository.save(user);

    return "Email was verified successfully.";
  }

  public async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  public async requestPasswordReset(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) throw new BadRequestException("invalid verification link");

    if (!user.resetPasswordToken) {
      user.resetPasswordToken = randomBytes(32).toString("hex");
      await this.userRepository.save(user);
    }

    const HOST = this.config.get<string>("HOST");
    const PORT = this.config.get<number>("PORT");
    const link = `http://${HOST}:${PORT}/api/auth/reset-password/${user.id}/${user.resetPasswordToken}`;

    await this.mailservice.sendResetPassword(user.email, link);

    return {
      message: "An email will be sent to you to reset your password.",
    };
  }

  public async renderResetPasswordForm(
    userId: number,
    resetPasswordToken: string,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) throw new BadRequestException("invalid link");

    if (
      user.resetPasswordToken === null ||
      user.resetPasswordToken !== resetPasswordToken
    ) {
      throw new BadRequestException("invalid link");
    }

    return {
      email: user.email,
      userId: user.id,
      resetPasswordToken,
    };
  }

  public async resetPassword(
    userId: number,
    resetPasswordToken: string,
    resetPasswordDto: ResetPasswordDto,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) throw new BadRequestException("invalid credentials");

    if (
      user.resetPasswordToken === null ||
      user.resetPasswordToken !== resetPasswordToken
    ) {
      throw new BadRequestException("invalid credentials");
    }

    const { password, confirmPassword } = resetPasswordDto;
    if (password !== confirmPassword) {
      throw new BadRequestException(
        "password and confirm-password fields don''t match",
      );
    }

    const hashedPassword = await this.hashPassword(password);

    Object.assign(user, { password: hashedPassword, resetPasswordToken: null });

    await this.userRepository.save(user);

    return "password was reseted successfully.";
  }

  private generateVerificationLink(userId: number, verificationToken: string) {
    const HOST = this.config.get<string>("HOST");
    const PORT = this.config.get<number>("PORT");
    return `http://${HOST}:${PORT}/api/auth/verify-email/${userId}/${verificationToken}`;
  }
}
