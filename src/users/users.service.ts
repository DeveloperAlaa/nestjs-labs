import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcryptjs";

import { User } from "./user.entity";
import { JWTGenerator } from "./jwtGenerator.service";
import { RegisterDto } from "./DTOs/register.dto";
import { LoginDto } from "./DTOs/login.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtGenerator: JWTGenerator,
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

    const accesstoken = await this.jwtGenerator.generate({
      id: newUser.id,
      role: newUser.userRole,
    });
    return { accesstoken };
  }

  public async login(dto: LoginDto) {
    const { email, password } = dto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new BadRequestException("Invalid Credintials.");

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) throw new BadRequestException("Invalid Credintials.");
    
    const accesstoken = await this.jwtGenerator.generate({
      id: user.id,
      role: user.userRole,
    });
    return { accesstoken };
  }
}
