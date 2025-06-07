import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import { NOTIFICATIONTYPE } from "src/domains/notifications/dto/send-notification.dto";

@Injectable()
export class EmailService {
  private readonly transporter: nodemailer.Transporter;

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService
  ) {
    this.transporter = nodemailer.createTransport({
      // host: configService.get('EMAIL_HOST'),
      // port: configService.get('EMAIL_PORT'),
      service: "gmail",
      // secure: true,
      auth: {
        user: this.configService.get<string>("EMAIL_USERNAME"),
        pass: this.configService.get<string>("EMAIL_PASSWORD")
      }
    });
  }

  /**
   * Sends an email.
   * @param {string} to - The email address of the recipient.
   * @param {string} subject - The subject of the email.
   * @param {string} text - The body text of the email.
   * @returns {Promise<nodemailer.SentMessageInfo>} A Promise that resolves when the email is sent.
   */
  async sendEmail(
    to: string,
    subject: string,
    text: string,
    priority?: NOTIFICATIONTYPE
  ) {
    try {
      const mailOptions: nodemailer.SendMailOptions = {
        from: "Tobi from E-vent <no-reply@event.com>",
        to: to || "enalsy22@gmail.com",
        subject,
        html: text
      };

      return this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }
}
