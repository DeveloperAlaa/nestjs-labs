import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from "@nestjs/common";

import { Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";

import { CreateProductDTO } from "./DTOs/create-product.dto";
import { UpdateProductDTO } from "./DTOs/update-product.dto";
import { ProductsService } from "./products.service";
import type { TProduct } from "./products.service";

@Controller("/api/products")
export class ProductsController {
  // FIX: this code to be fixed in the dependency injection lesson
  private productService: ProductsService = new ProductsService();

  @Get()
  public getAllProducts(): TProduct[] {
    return this.productService.getAll();
  }

  @Get(":id")
  public getSingleProduct(@Param("id", ParseIntPipe) id: number): TProduct {
    return this.productService.getOneBy(id);
  }

  @Post()
  public createProduct(@Body() body: CreateProductDTO): TProduct {
    return this.productService.create(body);
  }

  @Put(":id")
  public updateProduct(
    @Param("id", ParseIntPipe) id: number,
    @Body()
    body: UpdateProductDTO,
  ): TProduct {
    return this.productService.update(id, body);
  }

  @Delete(":id")
  public deleteProduct(@Param("id", ParseIntPipe) id: number): TProduct {
    return this.productService.delete(id);
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
