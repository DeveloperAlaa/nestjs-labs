import { Injectable, NotFoundException } from "@nestjs/common";
import { Like, Between, Repository } from "typeorm";

import { CreateProductDTO } from "./dtos/create-product.dto";
import { UpdateProductDTO } from "./dtos/update-product.dto";
import { Product } from "./product.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { UsersService } from "../users/providers/users.service";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepositry: Repository<Product>,
    private readonly usersService: UsersService,
  ) {}

  public async getAll(title?: string, minPrice?: string, maxPrice?: string) {
    const filter = {
      ...(title ? { title: Like(`%${title}%`) } : {}),
      ...(minPrice && maxPrice
        ? { price: Between(parseInt(minPrice), parseInt(maxPrice)) }
        : {}),
    };
    return await this.productsRepositry.find({
      where: filter,
      order: { id: "ASC" },
    });
  }

  public async getOneBy(id: number) {
    const product = await this.productsRepositry.findOne({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException("Product Not Found.");
    }
    return product;
  }

  public async create(dto: CreateProductDTO, userId: number) {
    const user = await this.usersService.getProfile(userId);

    const product = this.productsRepositry.create({
      ...dto,
      title: dto.title.toLowerCase(),
      user,
    });

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
