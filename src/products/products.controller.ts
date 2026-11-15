import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UnauthorizedException,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";

import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";

import { diskStorage } from "multer";

import type { Express, Response } from "express";

import { CreateProductDTO } from "./dtos/create-product.dto";
import { UpdateProductDTO } from "./dtos/update-product.dto";

import { ProductsService } from "./products.service";

import { AuthRoleGaurd } from "../users/guards/auth-role.guard";
import { AuthGaurd } from "../users/guards/auth.guard";

import { UserRole } from "../users/decorators/user-role.decorator";
import { UserPayload } from "../users/decorators/user-payload.decorator";

import type { JWTPayload } from "../utils/types";
import { TUserRole } from "../utils/enums";
import { generateFileName } from "../utils/funcs/filename-generator";

@Controller("/api/products")
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  // GET ~/api/products
  @Get()
  public async getAllProducts(
    @Query("title") title: string,
    @Query("minPrice") minPrice: string,
    @Query("maxPrice") maxPrice: string,
  ) {
    return await this.productService.getAll(title, minPrice, maxPrice);
  }

  // GET ~/api/products/:id
  @Get(":id")
  public async getSingleProduct(@Param("id", ParseIntPipe) id: number) {
    return await this.productService.getOneBy(id);
  }

  // POST ~/api/products
  @Post()
  @UserRole(TUserRole.Admin)
  @UseGuards(AuthRoleGaurd)
  public async createProduct(
    @Body() dto: CreateProductDTO,
    @UserPayload() payload: JWTPayload,
  ) {
    return await this.productService.create(dto, payload.id);
  }

  // PATCH ~/api/products/:id
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

  // DELET ~/api/products/:id
  @UserRole(TUserRole.Admin)
  @UseGuards(AuthRoleGaurd)
  @Delete(":id")
  public async deleteProduct(@Param("id", ParseIntPipe) id: number) {
    return await this.productService.delete(id);
  }

  // POST ~/api/products/:productId/images/primary
  @Post(":productId/images/primary")
  @UseGuards(AuthGaurd)
  @UseInterceptors(
    FileInterceptor("primary-image", {
      storage: diskStorage({
        destination: "./images/products/primary",
        filename: (req, file, callback) => {
          callback(null, generateFileName(file.originalname));
        },
      }),
      fileFilter: (req, file, callback) => {
        if (file.mimetype.startsWith("image")) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException("onlt image formats are acceptable"),
            false,
          );
        }
      },
      limits: { fileSize: 1024 * 1024 * 4 },
    }),
  )
  public async addPrimaryImage(
    @UserPayload() payload: JWTPayload,
    @Param("productId") productId: number,
    @UploadedFile() primaryImage: Express.Multer.File,
  ) {
    if (!primaryImage) throw new BadRequestException("no image was provided");
    return await this.productService.addPrimaryImage(
      productId,
      payload.id,
      primaryImage.filename,
    );
  }

  // GET ~/api/products/:productId/images/primary
  @Get(":productId/images/primary")
  @UseGuards(AuthGaurd)
  public async getPrimaryImage(
    @Param("productId", ParseIntPipe) productId: number,
    @UserPayload() payload: JWTPayload,
    @Res() res: Response,
  ) {
    const product = await this.productService.getOneBy(productId);

    if (product.user.id !== payload.id)
      throw new UnauthorizedException("access denied, not allowd");

    return res.sendFile(product.primaryImage, {
      root: "./images/products/primary",
    });
  }

  // POST ~/api/products/:productId/images/secondary
  @Post(":productId/images/secondary")
  @UseGuards(AuthGaurd)
  @UseInterceptors(
    FilesInterceptor("secondary-image", 5, {
      storage: diskStorage({
        destination: "./images/products/secondary",
        filename: (req, file, callback) => {
          callback(null, generateFileName(file.originalname));
        },
      }),
      fileFilter: (req, file, callback) => {
        if (file.mimetype.startsWith("image")) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException("onlt image formats are acceptable"),
            false,
          );
        }
      },
      limits: { fileSize: 1024 * 1024 * 4 },
    }),
  )
  public async addSecondaryImages(
    @UserPayload() payload: JWTPayload,
    @Param("productId") productId: number,
    @UploadedFiles() secondaryImages: Array<Express.Multer.File>,
  ) {
    if (!secondaryImages || secondaryImages.length === 0)
      throw new BadRequestException("no images were provided");

    const files = Object.fromEntries(
      secondaryImages.map((file, index) => [`file${index + 1}`, file.filename]),
    );

    return await this.productService.addSecondaryImages(
      productId,
      payload.id,
      files,
    );
  }

  // POST ~/api/products/:productId/images/secondary
  @Get(":productId/images/secondary/:imageNumber")
  @UseGuards(AuthGaurd)
  public async getSecondaryImages(
    @Param("productId") productId: number,
    @Param("imageNumber", ParseIntPipe) imageNumber: number,
    @UserPayload() payload: JWTPayload,
    @Res() res: Response,
  ) {
    if (imageNumber <= 0 || imageNumber > 5)
      throw new BadRequestException(
        "secondary image number can't be less than 1 and more than 5",
      );

    const product = await this.productService.getOneBy(productId);
    if (product.user.id !== payload.id)
      throw new UnauthorizedException("access denied, not allowd");

    const secondaryImages: string[][] = Object.entries(
      JSON.parse(product.secondaryImages),
    );
    res.sendFile(secondaryImages[imageNumber - 1][1], {
      root: "./images/products/secondary",
    });
  }
}
