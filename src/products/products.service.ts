import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { Like, Between, Repository } from "typeorm";

import { join } from "node:path";
import { unlinkSync } from "node:fs";

import { CreateProductDTO } from "./dtos/create-product.dto";
import { UpdateProductDTO } from "./dtos/update-product.dto";
import { Product } from "./product.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { UsersService } from "../users/users.service";

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

  public async addPrimaryImage(
    productId: number,
    userId: number,
    imageName: string,
  ) {
    const product = await this.getOneBy(productId);

    if (product.user.id !== userId)
      throw new UnauthorizedException("access denied, not allowd");

    if (product.primaryImage) {
      const oldImagePath = join(
        process.cwd(),
        "./images/products/primary",
        product.primaryImage,
      );
      unlinkSync(oldImagePath);
    }

    product.primaryImage = imageName;

    return await this.productsRepositry.save(product);
  }

  public async addSecondaryImages(
    productId: number,
    userId: number,
    files: Record<string, string>,
  ) {
    const product = await this.getOneBy(productId);

    if (product.user.id !== userId)
      throw new UnauthorizedException("access denied, not allowd");

    if (product.secondaryImages) {
      const oldFiles: string[][] = Object.entries(
        JSON.parse(product.secondaryImages),
      );

      for (let i = 0; i < oldFiles.length; i++) {
        const oldImagePath = join(
          process.cwd(),
          "./images/products/secondary",
          oldFiles[i][1],
        );

        unlinkSync(oldImagePath);
      }
    }

    product.secondaryImages = JSON.stringify(files);
    return await this.productsRepositry.save(product);
  }
}
