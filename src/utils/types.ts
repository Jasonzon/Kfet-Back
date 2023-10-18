import { JwtPayload } from "jsonwebtoken";
import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload["user"];
  role?: JwtPayload["role"];
  mail?: JwtPayload["mail"];
}
