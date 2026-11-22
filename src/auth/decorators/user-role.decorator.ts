import { SetMetadata } from "@nestjs/common";
import type { TUserRole } from "../../common/enums";

export const UserRole = (...roles: TUserRole[]) => SetMetadata("roles", roles);
