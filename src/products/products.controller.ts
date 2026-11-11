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

import { CreateProductDTO } from "./dtos/create-product.dto";
import { UpdateProductDTO } from "./dtos/update-product.dto";

import { ProductsService } from "./products.service";

import { AuthRoleGaurd } from "../users/guards/auth-role.guard";
import { UserRole } from "../users/decorators/user-role.decorator";
import { TUserRole } from "../utils/enums";
import { UserPayload } from "../users/decorators/user-payload.decorator";
import type { JWTPayload } from "../utils/types";

@Controller("/api/products")
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Get()
  public async getAllProducts(
    @Query("title") title: string,
    @Query("minPrice") minPrice: string,
    @Query("maxPrice") maxPrice: string,
  ) {
    return await this.productService.getAll(title, minPrice, maxPrice);
  }

  @Get(":id")
  public async getSingleProduct(@Param("id", ParseIntPipe) id: number) {
    return await this.productService.getOneBy(id);
  }

  @Post()
  @UserRole(TUserRole.Admin)
  @UseGuards(AuthRoleGaurd)
  public async createProduct(
    @Body() dto: CreateProductDTO,
    @UserPayload() payload: JWTPayload,
  ) {
    return await this.productService.create(dto, payload.id);
  }

  @UserRole(TUserRole.Admin)
  @UseGuards(AuthRoleGaurd)
  @Patch(":id")
  public async updateProduct(
    @Param("id", ParseIntPipe) id: number,
    @Body()
    dto: UpdateProductDTO,
  ) {
    return await this.productService.update(id, dto);
  }

  @UserRole(TUserRole.Admin)
  @UseGuards(AuthRoleGaurd)
  @Delete(":id")
  public async deleteProduct(@Param("id", ParseIntPipe) id: number) {
    return await this.productService.delete(id);
  }
}
