import { MailerService } from "@nestjs-modules/mailer";
import { Injectable, RequestTimeoutException } from "@nestjs/common";

@Injectable()
export class MailService {
  public constructor(private readonly mailerService: MailerService) {}

  public async sendRegisterEmail(email: string, verificationLink: string) {
    try {
      return await this.mailerService.sendMail({
        from: "<noreply@alaa.com>",
        to: email,
        subject: "Email Verification",
        template: "register",
        context: {
          email,
          serverName: "NestJS API",
          date: new Date().toUTCString(),
          verificationLink
        },
      });
    } catch (error) {
      console.log(error);
      throw new RequestTimeoutException();
    }
  }
}
