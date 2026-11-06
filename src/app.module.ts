import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ProductsModule } from "./products/products.module";
import { UsersModule } from "./users/users.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { OrdersModule } from "./orders/orders.module";
import { Product } from "./products/products.entity";

@Module({
  imports: [
    ProductsModule,
    UsersModule,
    ReviewsModule,
    OrdersModule,
    // these are going to be enviromental variables
    TypeOrmModule.forRoot({
      type: "postgres",

      username: "user",
      password: "password",
      database: "nestjs_basics_app",

      host: "localhost",
      port: 5432,

      synchronize: true, // only in development
      entities: [Product],
    }),
  ],
})
export class AppModule {}
