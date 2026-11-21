import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { join } from "node:path";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  // template engine 
  app.setBaseViewsDir(join(__dirname, "..", "views"))
  app.setViewEngine("ejs")

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error) => {
  console.log(error);
});
