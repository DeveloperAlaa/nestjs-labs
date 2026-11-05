import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { TUser, UsersService } from "../users/users.service";

type TOrder = {
  id: number;
  userId: number;
  name: string;
  price: number;
  quantity: number;
};

@Injectable()
export class OrdersService {
  private orders: TOrder[] = [
    { id: 1, userId: 1, name: "product 1", price: 42, quantity: 1 },
    { id: 2, userId: 2, name: "product 2", price: 2, quantity: 4 },
    { id: 3, userId: 3, name: "product 3", price: 56, quantity: 2 },
    { id: 4, userId: 4, name: "product 4", price: 12, quantity: 6 },
  ];

  // if we inject the service in a controller this step of using   @Inject(forwardRef(() => UsersService)) is not required
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  findAll() {
    return this.orders;
  }

  findOrdersAndUsers(): { orders: TOrder[]; users: TUser[] } {
    const users = this.usersService.getAll();
    return {
      orders: this.orders,
      users,
    };
  }
}
