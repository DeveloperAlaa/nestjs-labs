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

import { User } from "../users/user.entity";

import { AuthService } from "../auth/auth.service";

import { UpdateUserDto } from "./dtos/update-user.dto";

import { JWTPayload } from "../common/types";
import { TUserRole } from "../common/enums";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
  ) {}

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
      user.password = await this.authService.hashPassword(password);
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
