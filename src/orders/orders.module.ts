import { forwardRef, Module } from "@nestjs/common";

import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { UsersModule } from "../users/users.module";

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
  imports: [forwardRef(() => UsersModule)],
})
export class OrdersModule {}
