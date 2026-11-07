import { forwardRef, Module } from "@nestjs/common";

import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { OrdersModule } from "../orders/orders.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
  imports: [forwardRef(() => OrdersModule), TypeOrmModule.forFeature([User])],
})
export class UsersModule {}
