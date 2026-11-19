import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/adapters/handlebars.adapter";
// import { EjsAdapter } from "@nestjs-modules/mailer/adapters/ejs.adapter";

import { MailService } from "./mail.service";
import { ConfigService } from "@nestjs/config";
import { join } from "node:path";

@Module({
  providers: [MailService],
  exports: [MailService],
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>("SMTP_HOST"),
          port: config.get<string>("SMTP_PORT"),
          secure: false,
          auth: {
            user: config.get<string>("SMTP_USER"),
            pass: config.get<string>("SMTP_PASSWORD"),
          },
        },
        template: {
          dir: join(__dirname, "templates"),
          adapter: new HandlebarsAdapter(),
        },
      }),
    }),
  ],
})
export class MailModule {}
