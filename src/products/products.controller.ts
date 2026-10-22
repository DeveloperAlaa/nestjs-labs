import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from "@nestjs/common";

import { Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";

import type { CreateProductDTO } from "./DTOs/create-product.dto";
import type { UpdateProductDTO } from "./DTOs/update-product.dto";

type TProduct = {
  id: number;
  name: string;
  price: number;
};

@Controller("/api/products")
export class ProductsController {
  private products: TProduct[] = [
    {
      id: 1,
      name: "product 1",
      price: 32,
    },
    {
      id: 2,
      name: "product 2",
      price: 132,
    },
    {
      id: 3,
      name: "product 3",
      price: 453,
    },
    {
      id: 4,
      name: "product 4",
      price: 103,
    },
  ];

  @Get()
  public getAllProducts(): TProduct[] {
    return this.products;
  }

  @Get(":id")
  public getSingleProduct(@Param("id") id: string): TProduct {
    const product = this.products.find((p) => p.id === parseInt(id));
    if (!product) {
      throw new NotFoundException("Product Not Found.");
    }
    return product;
  }

  @Post()
  public createProduct(@Body() body: CreateProductDTO): TProduct {
    const newProduct: TProduct = {
      id: this.products.length + 1,
      name: body.name,
      price: body.price,
    };

    this.products.push(newProduct);

    return newProduct;
  }

  @Put(":id")
  public updateProduct(
    @Param("id") id: string,
    @Body() body: UpdateProductDTO,
  ): TProduct {
    const product = this.products.find((p) => p.id === parseInt(id));
    if (!product) {
      throw new NotFoundException("Product Not Found.");
    }
    const productIndex: number = this.products.findIndex((p) => p === product);

    const newProduct: TProduct = {
      ...product,
      ...body,
    };
    this.products.splice(productIndex, 1, newProduct);
    return newProduct;
  }

  @Delete(":id")
  public deleteProduct(@Param("id") id: string): TProduct {
    const product = this.products.find((p) => p.id === parseInt(id));

    if (!product) {
      throw new NotFoundException("Product Not Found.");
    }

    const productIndex = this.products.findIndex((p) => p === product);

    this.products.splice(productIndex, 1);
    return product;
  }

  // Access Express.js req, res objects
  @Post("/express")
  public createProducExpress(
    @Req() req: Request<{}, {}, { name: string; price: number }>,
    @Res() res: Response,
  ) {
    const newProduct: TProduct = {
      id: this.products.length + 1,
      name: req.body.name,
      price: req.body.price,
    };

    res.status(201).json(newProduct);
  }
}
