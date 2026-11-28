import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";

import helmet from "helmet"

import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";
import { join } from "node:path";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  // api response headers security
  app.use(helmet())

  // template engine
  app.setBaseViewsDir(join(__dirname, "..", "views"));
  app.setViewEngine("ejs");

  // swagger api documentation
  const swaggerConfig = new DocumentBuilder()
    .setVersion("1.0")
    .setTitle("Nestjs Mastery App")
    .setDescription(
      "This is a NestJS application where I practice what I learn in the course",
    )
    // .setTermsOfService("link of the terms page")
    // .setLicense("license name", "url")
    // .addServer("")
    // .addServer("")
    .addBearerAuth({
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      in: "header",
    })
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, document);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error) => {
  console.log(error);
});
