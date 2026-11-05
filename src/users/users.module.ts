import { forwardRef, Module } from "@nestjs/common";

import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { OrdersModule } from "../orders/orders.module";

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
  imports: [forwardRef(() => OrdersModule)],
})
export class UsersModule {}
