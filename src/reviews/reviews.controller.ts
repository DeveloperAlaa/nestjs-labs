import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { AuthRoleGaurd } from "../users/guards/auth-role.guard";
import { UserRole } from "../users/decorators/user-role.decorator";
import { TUserRole } from "../utils/enums";
import { CreateReviewDto } from "./dtos/create-review.dto";
import { UserPayload } from "../users/decorators/user-payload.decorator";
import type { JWTPayload } from "../utils/types";
import { UpdateReviewDto } from "./dtos/update-review.dto";
import { AuthGaurd } from "../users/guards/auth.guard";

@Controller("/api/reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post(":productId")
  @UserRole(TUserRole.Admin, TUserRole.User)
  @UseGuards(AuthRoleGaurd)
  public async createReview(
    @Body() body: CreateReviewDto,
    @Param("productId", ParseIntPipe) productId: number,
    @UserPayload() payload: JWTPayload,
  ) {
    return await this.reviewsService.create(productId, payload.id, body);
  }

  @Get()
  @UserRole(TUserRole.Admin)
  @UseGuards(AuthRoleGaurd)
  public getAllReviews() {
    return this.reviewsService.getAll();
  }

  @Patch(":reviewId")
  @UseGuards(AuthGaurd)
  public updateReview(
    @Body() dto: UpdateReviewDto,
    @Param("reviewId", ParseIntPipe) reviewId: number,
    @UserPayload() payload: JWTPayload,
  ) {
    return this.reviewsService.update(reviewId, payload.id, dto);
  }

  @Delete(":reviewId")
  @UserRole(TUserRole.Admin, TUserRole.User)
  @UseGuards(AuthRoleGaurd)
  public deleteReview(
    @Param("reviewId", ParseIntPipe) reviewId: number,
    @UserPayload() payload: JWTPayload,
  ) {
    return this.reviewsService.delete(reviewId, payload);
  }
}
