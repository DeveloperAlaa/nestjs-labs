import { Injectable } from "@nestjs/common";
import { TUser, UsersService } from "../users/users.service";

export type TReview = {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment: string;
};

@Injectable()
export class ReviewsService {
  private reviews: TReview[] = [
    { id: 1, userId: 1, productId: 1, rating: 3.6, comment: "Good" },
    { id: 2, userId: 2, productId: 2, rating: 2.1, comment: "Bad" },
    { id: 3, userId: 3, productId: 3, rating: 4.0, comment: "Very Good" },
    { id: 4, userId: 4, productId: 4, rating: 5.0, comment: "Excellent" },
  ];

  // external dependency injection
  constructor(private readonly usersService: UsersService) {}

  findReviewsAndUsers(): { reviews: TReview[]; users: TUser[] } {
    const users = this.usersService.getAll();
    return {
      reviews: this.reviews,
      users,
    };
  }
}
