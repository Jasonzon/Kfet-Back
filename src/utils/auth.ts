import jwt, { JwtPayload } from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./types.js";
import "dotenv/config";
import { HTTP_FORBIDDEN, HTTP_WRONG_CREDENTIALS } from "./status.js";

export const auth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const jwtToken = req.header("token");
    if (!jwtToken) {
      return res.status(HTTP_FORBIDDEN).send("Not Authorized");
    }
    const payload: JwtPayload = jwt.verify(
      jwtToken,
      process.env.jwtSecret!
    ) as JwtPayload;
    if (!payload) {
      return res.status(HTTP_WRONG_CREDENTIALS).send("Not Authorized");
    }
    req.user = payload.userId;
    req.role = payload.role;
    req.mail = payload.mail;
    next();
  } catch (err: any) {
    console.error(err.message);
    return res.status(HTTP_FORBIDDEN).send("Not Authorized");
  }
};
