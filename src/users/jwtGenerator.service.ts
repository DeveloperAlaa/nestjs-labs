import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { JWTPayload } from "../utils/types";

@Injectable()
export class JWTGenerator {
  constructor(private readonly jwtService: JwtService) {}

  public generate(payload: JWTPayload) {
    return this.jwtService.signAsync(payload);
  }
}
