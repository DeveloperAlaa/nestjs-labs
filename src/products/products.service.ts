import { NotFoundException } from "@nestjs/common";
import { CreateProductDTO } from "./DTOs/create-product.dto";
import { UpdateProductDTO } from "./DTOs/update-product.dto";

export type TProduct = {
  id: number;
  name: string;
  price: number;
};

export class ProductsService {
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

  public getAll(): TProduct[] {
    return this.products;
  }

  public getOneBy(id: number): TProduct {
    const product = this.products.find((p) => p.id === id);
    if (!product) {
      throw new NotFoundException("Product Not Found.");
    }
    return product;
  }

  public create({ name, price }: CreateProductDTO): TProduct {
    const newProduct: TProduct = {
      id: this.products.length + 1,
      name,
      price,
    };

    this.products.push(newProduct);

    return newProduct;
  }

  public update(id: number, updateProductDTO: UpdateProductDTO): TProduct {
    const product = this.products.find((p) => p.id === id);
    if (!product) {
      throw new NotFoundException("Product Not Found.");
    }
    const productIndex: number = this.products.findIndex((p) => p === product);

    const newProduct: TProduct = {
      ...product,
      ...updateProductDTO,
    };
    this.products.splice(productIndex, 1, newProduct);
    return newProduct;
  }

  public delete(id: number): TProduct {
    const product = this.products.find((p) => p.id === id);

    if (!product) {
      throw new NotFoundException("Product Not Found.");
    }

    const productIndex = this.products.findIndex((p) => p === product);

    this.products.splice(productIndex, 1);
    return product;
  }
}
