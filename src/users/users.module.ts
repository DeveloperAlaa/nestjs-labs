import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

import { UsersController } from "./users.controller";
import { UsersService } from "./providers/users.service";
import { AuthProvider } from "./providers/auth.provider";
import { User } from "./user.entity";

@Module({
  controllers: [UsersController],
  providers: [UsersService, AuthProvider],
  exports: [UsersService],
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        global: true,
        secret: config.get<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: config.get("JWT_EXPIRES_IN"),
        },
      }),
    }),
  ],
})
export class UsersModule {}
