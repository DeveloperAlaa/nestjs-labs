import { BadRequestException, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { MulterModule } from "@nestjs/platform-express";

import { diskStorage } from "multer";

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
    MulterModule.register({
      storage: diskStorage({
        destination: "./images/users",
        filename: (req, file, callback) => {
          const filePrefix = `${Date.now()}${Math.round(Math.random() * 1_000_000)}`;
          const fileExtension = file.originalname.split(".").at(-1);
          const fileName = `${filePrefix}.${fileExtension}`;
          callback(null, fileName);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (file.mimetype.startsWith("image")) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException("onlt image formats are acceptable"),
            false,
          );
        }
      },
      limits: { fileSize: 1024 * 1024 * 5 },
    }),
  ],
})
export class UsersModule {}
