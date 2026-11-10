import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { AuthProvider } from "./auth.provider";
import { User } from "../user.entity";

import { RegisterDto } from "../dtos/register.dto";
import { LoginDto } from "../dtos/login.dto";
import { UpdateDto } from "../dtos/update.dto";

import { AccessToken, JWTPayload } from "../../utils/types";
import { TUserRole } from "../../utils/enums";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly AuthProvider: AuthProvider,
  ) {}

  public async register(dto: RegisterDto): Promise<AccessToken> {
    return this.AuthProvider.register(dto);
  }

  public async login(dto: LoginDto): Promise<AccessToken> {
    return this.AuthProvider.login(dto);
  }

  public async getProfile(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException("user not found");
    return user;
  }

  public async getAll(): Promise<Omit<User, "password">[]> {
    return await this.userRepository.find();
  }

  public async update(id: number, dto: UpdateDto): Promise<User> {
    const { username, password } = dto;

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException("user not found");

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
}
