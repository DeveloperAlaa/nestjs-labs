import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { TUserRole } from "../../utils/enums";
import { JWTPayload } from "../../utils/types";
import { UsersService } from "../users.service";

@Injectable()
export class AuthRoleGaurd implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
    private readonly userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const roles: TUserRole[] = this.reflector.getAllAndOverride("roles", [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles || roles.length === 0) return false;

    const request: Request = context.switchToHttp().getRequest();
    const [type, token] = request.headers?.authorization?.split(" ") ?? [];

    if (type === "Bearer" && token) {
      try {
        const payload: JWTPayload = await this.jwtService.verifyAsync(token, {
          secret: this.config.get<string>("JWT_SECRET"),
        });

        const user = await this.userService.getProfile(payload.id);
        if (!user) return false;

        if (roles.includes(user.userRole)) {
          request["payload"] = payload;
          return true;
        }
      } catch (error) {
        throw new UnauthorizedException("access denied, invaild token");
      }
    } else {
      throw new UnauthorizedException("access denied, no token provided");
    }

    return false;
  }
}
