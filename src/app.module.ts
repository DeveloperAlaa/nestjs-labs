import {
  ClassSerializerInterceptor,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthModule } from "./auth/auth.module";
import { ProductsModule } from "./products/products.module";
import { UsersModule } from "./users/users.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { MailModule } from "./mail/mail.module";

import { Product } from "./products/product.entity";
import { User } from "./users/user.entity";
import { Review } from "./reviews/review.entity";
import { JwtConfigModule } from "./infrastructure/jwt/jwt.module";
import { LoggerMiddleware } from "./common/middlewares/logger.middleware";

@Module({
  imports: [
    AuthModule,
    ProductsModule,
    UsersModule,
    ReviewsModule,
    MailModule,
    JwtConfigModule,
    // enviroment variables module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),

    // these are going to be enviromental variables
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",

        username: config.get<string>("DB_USERNAME"),
        password: config.get<string>("DB_PASSWORD"),
        database: config.get<string>("DB_DATABASE"),

        host: config.get<string>("DB_HOST"),
        port: config.get<number>("DB_PORT"),

        synchronize: process.env.NODE_ENV !== "production", // only true in development

        entities: [User, Product, Review],
      }),
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .exclude({
        path: "api/products",
        method: RequestMethod.DELETE,
      })
      .forRoutes({
        path: "api/products",
        method: RequestMethod.ALL,
      });

    consumer.apply(LoggerMiddleware).forRoutes({
      path: "api/users",
      method: RequestMethod.POST,
    });
  }
}
