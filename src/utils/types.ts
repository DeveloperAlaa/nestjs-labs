import { UserRole } from "./enums";

export type JWTPayload = {
  id: number;
  role: UserRole;
};
