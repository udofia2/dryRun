import { EXHIBITTYPE } from "@prisma/client";

export const DATABASE_URL = process.env.DATABASE_URL;
console.log(`DATABASE_URL: ${DATABASE_URL}`);

export const PORT = process.env.PORT;
export const NODE_ENV = process.env.ENV;
export const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY;
export const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const RESET_TOKEN_EXPIRY = process.env.RESET_TOKEN_EXPIRY;
export const TERMII_API_KEY = process.env.TERMII_API_KEY;
export const TERMII_EMAIL_ID = process.env.TERMII_EMAIL_ID;
export const TERMII_SEND_EMAIL_URL = process.env.TERMII_SEND_EMAIL_URL;

export const ExhibitType = new Set(Object.values(EXHIBITTYPE));

export const OTP_CACHE_EXPIRY = 1000 * 60 * 10;
