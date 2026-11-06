import { Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";

import { CreateProductDTO } from "./DTOs/create-product.dto";
import { UpdateProductDTO } from "./DTOs/update-product.dto";
import { Product } from "./products.entity";
import { InjectRepository } from "@nestjs/typeorm";

export type TProduct = {
  id: number;
  name: string;
  price: number;
};

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepositry: Repository<Product>,
  ) {}

  public async getAll() {
    return await this.productsRepositry.find({ order: { id: "ASC" } });
  }

  public async getOneBy(id: number) {
    const product = await this.productsRepositry.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException("Product Not Found.");
    }
    return product;
  }

  public async create(dto: CreateProductDTO) {
    const product = this.productsRepositry.create(dto);

    return await this.productsRepositry.save(product);
  }

  public async update(id: number, dto: UpdateProductDTO) {
    let product = await this.getOneBy(id);

    product = {
      ...product,
      ...dto,
    };

    return await this.productsRepositry.save(product);
  }

  public async delete(id: number) {
    const product = await this.getOneBy(id);
    await this.productsRepositry.remove(product);

    return {
      message: "Product was deleted successfully.",
    };
  }
}
