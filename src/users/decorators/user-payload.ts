import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { JWTPayload } from "../../utils/types";

export const UserPayload = createParamDecorator(
  (data, context: ExecutionContext) => {
    const request: Request = context.switchToHttp().getRequest();
    const payload: JWTPayload = request["payload"];
    return payload;
  },
);
