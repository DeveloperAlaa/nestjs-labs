import { ClassSerializerInterceptor, Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ProductsModule } from "./products/products.module";
import { UsersModule } from "./users/users.module";
import { ReviewsModule } from "./reviews/reviews.module";

import { Product } from "./products/product.entity";
import { User } from "./users/user.entity";
import { Review } from "./reviews/review.entity";

@Module({
  imports: [
    ProductsModule,
    UsersModule,
    ReviewsModule,

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
      useClass: ClassSerializerInterceptor
    }
  ]
})
export class AppModule {}
