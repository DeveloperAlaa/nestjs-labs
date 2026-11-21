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
          verificationLink,
        },
      });
    } catch (error) {
      console.log(error);
      throw new RequestTimeoutException();
    }
  }

  public async sendResetPassword(email: string, link: string) {
    try {
      await this.mailerService.sendMail({
        from: "<no-reply@alaa.com>",
        to: email,
        subject: "Reset Password",
        template: "reset-password",
        context: {
          email,
          link,
          date: new Date().toUTCString(),
          serverName: "NestJS API",
        },
      });
    } catch (error) {
      console.log(error);
      throw new RequestTimeoutException();
    }
  }
}
