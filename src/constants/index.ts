export * from "./interfaces";
export * from "./activities";
export * from "./auth";

export const DATABASE_URL = process.env.DATABASE_URL;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

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
export const FRONTEND_BASEURL = process.env.FRONTEND_BASEURL;

export const OTP_CACHE_EXPIRY = 1000 * 60 * 10;
