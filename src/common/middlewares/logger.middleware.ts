import { Injectable, NestMiddleware } from "@nestjs/common";
import type { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  public use(req: Request, res: Response, next: NextFunction) {
    console.log({
      host: req.hostname,
      path: req.path,
      method: req.method,
    });
    next();
  }
}
