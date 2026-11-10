import { TUserRole } from "./enums";

export type JWTPayload = {
  id: number;
  role: TUserRole;
};

export type AccessToken = {
  accessToken: string;
};
