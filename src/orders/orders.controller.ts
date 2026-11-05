import { Controller, Get } from "@nestjs/common";
import { OrdersService } from "./orders.service";

@Controller("/api/orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll() {
    return this.ordersService.findOrdersAndUsers();
  }
}
