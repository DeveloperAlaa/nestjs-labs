import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";

import { Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";

import { CreateProductDTO } from "./DTOs/create-product.dto";
import { UpdateProductDTO } from "./DTOs/update-product.dto";
import { ProductsService } from "./products.service";
import type { TProduct } from "./products.service";

@Controller("/api/products")
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Get()
  public async getAllProducts() {
    return await this.productService.getAll();
  }

  @Get(":id")
  public async getSingleProduct(@Param("id", ParseIntPipe) id: number) {
    return await this.productService.getOneBy(id);
  }

  @Post()
  public async createProduct(@Body() body: CreateProductDTO) {
    return await this.productService.create(body);
  }

  @Patch(":id")
  public async updateProduct(
    @Param("id", ParseIntPipe) id: number,
    @Body()
    body: UpdateProductDTO,
  ) {
    return await this.productService.update(id, body);
  }

  @Delete(":id")
  public async deleteProduct(@Param("id", ParseIntPipe) id: number) {
    return await this.productService.delete(id);
  }

  // Access Express.js req, res objects
  @Post("/express")
  public createProducExpress(
    @Req() req: Request<{}, {}, { name: string; price: number }>,
    @Res() res: Response,
  ) {
    const newProduct: TProduct = {
      id: 99,
      name: req.body.name,
      price: req.body.price,
    };

    res.status(201).json(newProduct);
  }
}
