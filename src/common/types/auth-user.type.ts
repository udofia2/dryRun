export type JwtPayload = {
  id: string;
  firstname: string;
  email: string;
  type: string;
  city: string | null;
  state: string | null;
  iat: number;
  exp: number;
};
