import { User } from "@prisma/client";
import { Tokens } from "./tokens.type";

export type AuthResponse = {
  user: User;
  tokens: Tokens;
};
