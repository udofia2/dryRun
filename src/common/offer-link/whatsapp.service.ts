// import { Injectable } from "@nestjs/common";
// import { Twilio } from "twilio";

// @Injectable()
// export class WhatsAppService {
//   private twilioClient = new Twilio("TWILIO_SID", "TWILIO_AUTH_TOKEN");

//   async sendOfferViaWhatsApp(offerLink: string, clientPhoneNumber: string) {
//     await this.twilioClient.messages.create({
//       body: `Click the link below to view and accept/reject your offer: ${offerLink}`,
//       from: "whatsapp:+14155238886", // Twilio WhatsApp number
//       to: `whatsapp:${clientPhoneNumber}`
//     });
//   }
// }
