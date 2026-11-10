import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { JwtService } from "@nestjs/jwt";
import { Repository } from "typeorm";
import * as bcrypt from "bcryptjs";

import { User } from "../user.entity";

import { RegisterDto } from "../dtos/register.dto";
import { LoginDto } from "../dtos/login.dto";

import { AccessToken } from "../../utils/types";

@Injectable()
export class AuthProvider {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  public async register(dto: RegisterDto): Promise<AccessToken> {
    const { username, email, password } = dto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (user) throw new BadRequestException("Invalid Credintials.");

    const hashedPassword = await this.hashPassword(password);

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

  public async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }
}
