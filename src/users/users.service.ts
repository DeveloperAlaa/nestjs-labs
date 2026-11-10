import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { JwtService } from "@nestjs/jwt";
import { Repository } from "typeorm";
import * as bcrypt from "bcryptjs";

import { User } from "./user.entity";

import { RegisterDto } from "./dtos/register.dto";
import { LoginDto } from "./dtos/login.dto";
import { UpdateDto } from "./dtos/update.dto";

import { AccessToken, JWTPayload } from "../utils/types";
import { TUserRole } from "../utils/enums";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  public async register(dto: RegisterDto): Promise<AccessToken> {
    const { username, email, password } = dto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (user) throw new BadRequestException("Invalid Credintials.");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let newUser = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
    });
    newUser = await this.userRepository.save(newUser);

    const accessToken = await this.jwtService.signAsync({
      id: newUser.id,
      role: newUser.userRole,
    });
    return { accessToken };
  }

  public async login(dto: LoginDto): Promise<AccessToken> {
    const { email, password } = dto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new BadRequestException("Invalid Credintials.");

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) throw new BadRequestException("Invalid Credintials.");

    const accessToken = await this.jwtService.signAsync({
      id: user.id,
      role: user.userRole,
    });
    return { accessToken };
  }

  public async getProfile(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException("user not found");
    Object.assign(user, { password: undefined });
    return user;
  }

  public async getAll(): Promise<Omit<User, "password">[]> {
    const users = await this.userRepository.find();
    return users.map((user) => ({ ...user, password: undefined }));
  }

  public async update(id: number, dto: UpdateDto) {
    const { username, password } = dto;

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException("user not found");

    user.username = username ?? user.username;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }
    await this.userRepository.save(user);
    Object.assign(user, { password: undefined });
    return user;
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
