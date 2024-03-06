import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {
  Inject,
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException
} from "@nestjs/common";
import axios from "axios";
import { Cache } from "cache-manager";
import {
  NODE_ENV,
  OTP_CACHE_EXPIRY,
  TERMII_API_KEY,
  TERMII_EMAIL_ID,
  TERMII_SEND_EMAIL_URL
} from "src/constants";

@Injectable()
export class OtpService {
  constructor(@Inject(CACHE_MANAGER) private cacheService: Cache) {}
  API_KEY = TERMII_API_KEY;
  EMAIL_ID = TERMII_EMAIL_ID;
  SEND_EMAIL_URL = TERMII_SEND_EMAIL_URL;

  private async generateOtp(): Promise<{
    otp: number;
    otpExpiry: number;
  }> {
    const otp: number = Math.floor(100000 + Math.random() * 900000);
    const expiryDuration = 1000 * 60 * 10;
    const otpExpiry = Date.now() + expiryDuration;

    return { otp, otpExpiry };
  }

  async sendOtpViaEmail(email_address: string): Promise<void> {
    const { otp, otpExpiry } = await this.generateOtp();

    const data = {
      api_key: this.API_KEY,
      email_address: email_address,
      email_configuration_id: this.EMAIL_ID,
      code: otp
    };

    if (NODE_ENV === "production") {
      await axios.post(this.SEND_EMAIL_URL, data);
    }

    await this.cacheService.set(
      email_address + "_user_id",
      data.email_address,
      OTP_CACHE_EXPIRY
    );
    await this.cacheService.set(
      email_address + "_otp",
      data.code,
      OTP_CACHE_EXPIRY
    );
    await this.cacheService.set(
      email_address + "_otpExpiry",
      otpExpiry.toString(),
      OTP_CACHE_EXPIRY
    );

    return;
  }

  private async retrieveOtpRecord(tmp_id: string): Promise<any> {
    const user_id = await this.cacheService.get(`${tmp_id}_user_id`);
    const token = await this.cacheService.get(`${tmp_id}_otp`);
    const otpExpiry = await this.cacheService.get(`${tmp_id}_otpExpiry`);

    return { user_id, token, otpExpiry };
  }

  private async invalidateOtp(tmp_id: string): Promise<void> {
    await this.cacheService.del(`${tmp_id}_otp`);
    await this.cacheService.del(`${tmp_id}_user_id`);
    await this.cacheService.del(`${tmp_id}_otpExpiry`);
    return;
  }

  async verifyOtpSentViaEmail(
    email_address: string,
    otp: number
  ): Promise<any> {
    try {
      const { user_id, token, otpExpiry } =
        await this.retrieveOtpRecord(email_address);

      if (!otp || new Date(otpExpiry) < new Date() || token != otp) {
        throw new BadRequestException("Invalid or Expired OTP!");
      }

      await this.invalidateOtp(email_address);

      return {
        status: "success",
        message: "OTP verified successfully",
        user_id
      };
    } catch (error) {
      throw new HttpException(
        error.message || "Error verifying OTP",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
