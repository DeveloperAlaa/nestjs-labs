import { Module } from "@nestjs/common";

import { ReviewsController } from "./reviews.controller";
import { ReviewsService } from "./reviews.service";
import { UsersModule } from "../users/users.module";

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService],
  imports: [UsersModule]
})
export class ReviewsModule {}
