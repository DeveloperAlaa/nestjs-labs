import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
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

import { ProductsService } from "./products.service";

import { CreateProductDTO } from "./dtos/create-product.dto";
import { UpdateProductDTO } from "./dtos/update-product.dto";

import { AuthRoleGaurd } from "../auth/guards/auth-role.guard";
import { AuthGaurd } from "../auth/guards/auth.guard";

import { UserRole } from "../auth/decorators/user-role.decorator";
import { UserPayload } from "../auth/decorators/user-payload.decorator";

import type { JWTPayload } from "../common/types";
import { TUserRole } from "../common/enums";
import { generateFileName } from "../utils/funcs/filename-generator";

import { SkipThrottle } from "@nestjs/throttler";

// swagger documentation
import {
  ApiTags,
  ApiQuery,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from "@nestjs/swagger";

@ApiTags("Products Routes")
@Controller("/api/products")
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  // GET ~/api/products
  @ApiQuery({ name: "title", type: "string", required: false })
  @ApiQuery({ name: "minPrice", type: "number", required: false })
  @ApiQuery({ name: "maxPrice", type: "number", required: false })
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
  @ApiBearerAuth()
  @UserRole(TUserRole.Admin)
  @UseGuards(AuthRoleGaurd)
  @Post()
  public async createProduct(
    @Body() dto: CreateProductDTO,
    @UserPayload() payload: JWTPayload,
  ) {
    return await this.productService.create(dto, payload.id);
  }

  // PATCH ~/api/products/:id
  @ApiBearerAuth()
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
  @ApiBearerAuth()
  @UserRole(TUserRole.Admin)
  @UseGuards(AuthRoleGaurd)
  @Delete(":id")
  public async deleteProduct(@Param("id", ParseIntPipe) id: number) {
    return await this.productService.delete(id);
  }

  // POST ~/api/products/:productId/images/primary
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        "primary-image": {
          type: "string",
          format: "binary",
        },
      },
    },
  })
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
  @Post(":productId/images/primary")
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
  @ApiBearerAuth()
  @UseGuards(AuthGaurd)
  @Get(":productId/images/primary")
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
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        "secondary-image": {
          type: "array",
          items: {
            type: "string",
            format: "binary",
          },
          minItems: 2,
          maxItems: 4,
        },
      },
    },
  })
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
  @Post(":productId/images/secondary")
  public async addSecondaryImages(
    @UserPayload() payload: JWTPayload,
    @Param("productId") productId: number,
    @UploadedFiles() secondaryImages: Array<Express.Multer.File>,
  ) {
    if (!secondaryImages || secondaryImages.length === 0)
      throw new BadRequestException("no images were provided");

    return await this.productService.addSecondaryImages(
      productId,
      payload.id,
      secondaryImages,
    );
  }

  // GET ~/api/products/:productId/images/secondary
  @ApiBearerAuth()
  @UseGuards(AuthGaurd)
  @Get(":productId/images/secondary/:imageNumber")
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

    try {
      res.sendFile(product.secondaryImages[imageNumber - 1], {
        root: "./images/products/secondary",
      });
    } catch (error) {
      throw new NotFoundException("image not found");
    }
  }
}
