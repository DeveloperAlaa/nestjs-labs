import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { join } from "node:path";
import { unlinkSync } from "node:fs";

import { AuthProvider } from "./auth.provider";
import { User } from "../user.entity";

import { RegisterUserDto } from "../dtos/register-user.dto";
import { LoginUserDto } from "../dtos/login-user.dto";
import { UpdateUserDto } from "../dtos/update-user.dto";

import { AccessToken, JWTPayload } from "../../utils/types";
import { TUserRole } from "../../utils/enums";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly AuthProvider: AuthProvider,
  ) {}

  public async register(dto: RegisterUserDto) {
    return this.AuthProvider.register(dto);
  }

  public async login(dto: LoginUserDto) {
    return this.AuthProvider.login(dto);
  }

  public async verifyEmail(userId: number, verificationToken: string) {
    return await this.AuthProvider.verifyEmail(userId, verificationToken);
  }

  public async getProfile(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException("user not found");
    return user;
  }

  public async getAll(): Promise<Omit<User, "password">[]> {
    return await this.userRepository.find();
  }

  public async update(id: number, dto: UpdateUserDto): Promise<User> {
    const { username, password } = dto;

    const user = await this.getProfile(id);

    user.username = username ?? user.username;

    if (password) {
      user.password = await this.AuthProvider.hashPassword(password);
    }
    return await this.userRepository.save(user);
  }

  public async delete(id: number, payload: JWTPayload) {
    const user = await this.getProfile(id);

    if (payload.id === id || payload.role === TUserRole.Admin) {
      await this.userRepository.remove(user);
      return { message: "user was deleted successfully" };
    }

    throw new ForbiddenException("access denied, not allowd");
  }

  public async addProfileImage(userId: number, imageName: string) {
    const user = await this.getProfile(userId);
    if (user.profileImage === null) {
      user.profileImage = imageName;
      return await this.userRepository.save(user);
    }

    await this.removeProfileImage(userId);
    user.profileImage = imageName;
    return await this.userRepository.save(user);
  }

  public async removeProfileImage(userId: number) {
    const user = await this.getProfile(userId);

    if (user.profileImage === null)
      throw new BadRequestException("there is already no profile image");

    const oldProfileImagePath = join(
      process.cwd(),
      "images/users",
      user.profileImage,
    );
    unlinkSync(oldProfileImagePath);

    Object.assign(user, { profileImage: null });

    return await this.userRepository.save(user);
  }
}
