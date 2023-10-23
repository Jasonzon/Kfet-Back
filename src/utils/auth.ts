import jwt, { JwtPayload } from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./types.js";
import "dotenv/config";
import {
  HTTP_BAD_REQUEST,
  HTTP_FORBIDDEN,
  HTTP_SERVER_ERROR,
  HTTP_WRONG_CREDENTIALS,
} from "./status.js";

export const auth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const jwtToken = req.header("token");
    if (!jwtToken) {
      return res.status(HTTP_BAD_REQUEST).send("Token required");
    }
    jwt.verify(jwtToken, process.env.jwtSecret!, async function (err, payload) {
      if (err) {
        return res.status(HTTP_FORBIDDEN).json({ message: "Invalid token" });
      }
      req.user = (payload as JwtPayload).userId;
      req.role = (payload as JwtPayload).role;
      req.mail = (payload as JwtPayload).mail;
      next();
    });
  } catch (err: any) {
    console.error(err.message);
    return res.status(HTTP_SERVER_ERROR).send("Error server");
  }
};
