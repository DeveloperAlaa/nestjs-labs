import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Repository } from "typeorm";

import { Review } from "./review.entity";

import { CreateReviewDto } from "./dtos/create-review.dto";
import { UpdateReviewDto } from "./dtos/update-review.dto";

import { UsersService } from "../users/providers/users.service";
import { ProductsService } from "../products/products.service";

import { TUserRole } from "../utils/enums";
import { JWTPayload } from "../utils/types";

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {}

  public async create(productId: number, userId: number, dto: CreateReviewDto) {
    const product = await this.productsService.getOneBy(productId);
    const user = await this.usersService.getProfile(userId);

    let newReview = this.reviewsRepository.create({ ...dto, product, user });

    newReview = await this.reviewsRepository.save(newReview);

    return {
      id: newReview.id,
      rating: newReview.rating,
      comment: newReview.comment,
      userId,
      productId,
    };
  }

  public async getAll(page: number, limit: number) {
    const total = await this.reviewsRepository.count();
    const totalPages = Math.ceil(total / limit);

    if (page === 0 || limit === 0)
      throw new BadRequestException(
        "page and limit search queries can not be 0.",
      );
    if (page > totalPages)
      throw new NotFoundException("request page dosn't exist.");

    const reviews = await this.reviewsRepository.find({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
    });
    const meta = {
      page,
      limit,
      totalPages: totalPages,
      prevPage: page - 1 > 0,
      nextPage: page < totalPages,
    };

    return {
      data: reviews,
      meta,
    };
  }

  public async update(reviewId: number, userId: number, dto: UpdateReviewDto) {
    let review = await this.getOneBy(reviewId);
    if (!(userId === review.user.id))
      throw new ForbiddenException("access denied, you are not allowed");

    return await this.reviewsRepository.save({ ...review, ...dto });
  }

  public async delete(reviewId: number, payload: JWTPayload) {
    const review = await this.getOneBy(reviewId);

    if (payload.id === review.user.id || payload.role === TUserRole.Admin) {
      await this.reviewsRepository.remove(review);
      return { message: "review was deleted successfully" };
    } else {
      throw new ForbiddenException("access denied, not allowd");
    }
  }

  private async getOneBy(id: number) {
    const review = await this.reviewsRepository.findOne({ where: { id } });
    if (!review) throw new NotFoundException("review is not found");
    return review;
  }
}
