import { SetMetadata } from "@nestjs/common";
import type { TUserRole } from "../../utils/enums";

export const UserRole = (...roles: TUserRole[]) => SetMetadata("roles", roles);
