import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { OrdersService } from "../orders/orders.service";

export type TUser = { id: number; name: string; email: string };

@Injectable()
export class UsersService {
  private users: TUser[] = [
    { id: 1, name: "Alaa Abdo", email: "a@a.com" },
    { id: 2, name: "Sarah Ahmed", email: "s@s.com" },
    { id: 3, name: "Fady Ali", email: "f@f.com" },
    { id: 4, name: "Magdy Salah", email: "m@m.com" },
  ];

  constructor(
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
  ) {}

  public getAll(): TUser[] {
    return this.users;
  }

  public getUsersAndOrders() {
    const orders = this.ordersService.findAll();
    return {
      users: this.users,
      orders,
    };
  }
}
