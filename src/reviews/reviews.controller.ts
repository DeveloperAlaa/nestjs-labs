import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ReviewsService } from "./reviews.service";

import { CreateReviewDto } from "./dtos/create-review.dto";
import { UpdateReviewDto } from "./dtos/update-review.dto";

import { AuthRoleGaurd } from "../auth/guards/auth-role.guard";
import { AuthGaurd } from "../auth/guards/auth.guard";

import { UserRole } from "../auth/decorators/user-role.decorator";
import { TUserRole } from "../common/enums";

import { UserPayload } from "../auth/decorators/user-payload.decorator";
import type { JWTPayload } from "../common/types";

// swagger documentation
import { ApiBearerAuth } from "@nestjs/swagger";

@Controller("/api/reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // GET ~/api/reviews/:id
  @ApiBearerAuth()
  @UserRole(TUserRole.Admin, TUserRole.User)
  @UseGuards(AuthRoleGaurd)
  @Post(":productId")
  public async createReview(
    @Body() body: CreateReviewDto,
    @Param("productId", ParseIntPipe) productId: number,
    @UserPayload() payload: JWTPayload,
  ) {
    return await this.reviewsService.create(productId, payload.id, body);
  }

  // GET ~/api/reviews/
  @ApiBearerAuth()
  @UserRole(TUserRole.Admin)
  @UseGuards(AuthRoleGaurd)
  @Get()
  public getAllReviews(
    @Query("page", ParseIntPipe) page: number,
    @Query("limit", ParseIntPipe) limit: number,
  ) {
    return this.reviewsService.getAll(page, limit);
  }

  // PATCH ~/api/reviews/:reviewId
  @ApiBearerAuth()
  @UseGuards(AuthGaurd)
  @Patch(":reviewId")
  public updateReview(
    @Body() dto: UpdateReviewDto,
    @Param("reviewId", ParseIntPipe) reviewId: number,
    @UserPayload() payload: JWTPayload,
  ) {
    return this.reviewsService.update(reviewId, payload.id, dto);
  }

  // DELETE ~/api/reviews/:reviewId
  @ApiBearerAuth()
  @UserRole(TUserRole.Admin, TUserRole.User)
  @UseGuards(AuthRoleGaurd)
  @Delete(":reviewId")
  public deleteReview(
    @Param("reviewId", ParseIntPipe) reviewId: number,
    @UserPayload() payload: JWTPayload,
  ) {
    return this.reviewsService.delete(reviewId, payload);
  }
}
