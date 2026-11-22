import { BadRequestException, forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { MulterModule } from "@nestjs/platform-express";

import { diskStorage } from "multer";

import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

import { AuthModule } from "../auth/auth.module";

import { User } from "./user.entity";
import { generateFileName } from "../utils/funcs/filename-generator";
import { MailModule } from "../mail/mail.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
  imports: [
    MailModule,

    forwardRef(() => AuthModule),

    TypeOrmModule.forFeature([User]),

    MulterModule.register({
      storage: diskStorage({
        destination: "./images/users",
        filename: (req, file, callback) => {
          callback(null, generateFileName(file.originalname));
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
