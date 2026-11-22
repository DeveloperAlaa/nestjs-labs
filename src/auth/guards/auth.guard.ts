import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

@Injectable()
export class AuthGaurd implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();

    const [type, token] = request.headers?.authorization?.split(" ") ?? [];

    if (type === "Bearer" && token) {
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: this.config.get<string>("JWT_SECRET"),
        });

        request["payload"] = payload;
        return true;
      } catch (error) {
        throw new UnauthorizedException("invaild token");
      }
    } else {
      throw new UnauthorizedException("access denied, no token provided");
    }
  }
}
