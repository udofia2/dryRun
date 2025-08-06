import { User, Organization } from "@prisma/client";
import { Tokens } from "./tokens.type";
import { UserResponse } from "src/users/users.service";

export type AuthResponse = {
  user: UserResponse;
  tokens: Tokens;
};
