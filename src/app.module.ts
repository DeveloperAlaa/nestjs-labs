import { Module } from "@nestjs/common";

import { ProductsModule } from "./products/products.module";
import { UsersModule } from "./users/users.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { OrdersModule } from "./orders/orders.module";

@Module({
  imports: [ProductsModule, UsersModule, ReviewsModule, OrdersModule],
})
export class AppModule {}
