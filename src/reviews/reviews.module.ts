import { Module } from "@nestjs/common";

import { ReviewsController } from "./reviews.controller";
import { ReviewsService } from "./reviews.service";
import { UsersModule } from "../users/users.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Review } from "./review.entity";

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService],
  imports: [UsersModule, TypeOrmModule.forFeature([Review])],
})
export class ReviewsModule {}
