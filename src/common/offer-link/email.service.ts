import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "your-email@gmail.com",
      pass: "your-email-password"
    }
  });

  async sendOfferEmail(offerLink: string, clientEmail: string) {
    const mailOptions = {
      from: "your-email@gmail.com",
      to: clientEmail,
      subject: "Your Offer Link",
      html: `
        <p>Click the link below to view and accept/reject your offer:</p>
        <a href="${offerLink}">Accept or Reject Offer</a>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }
}
