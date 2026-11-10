import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcryptjs";

import { User } from "./user.entity";
import { RegisterDto } from "./dtos/register.dto";
import { LoginDto } from "./dtos/login.dto";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  public async register(dto: RegisterDto) {
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

  public async login(dto: LoginDto) {
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

  public async getProfile(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException("user not found");
    Object.assign(user, { password: undefined });
    return user;
  }
}
