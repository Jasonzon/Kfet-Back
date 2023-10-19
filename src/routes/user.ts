import express, { Response, NextFunction, Request } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { auth } from "../utils/auth.js";
import { jwtGenerator } from "../utils/jwtGenerator.js";
import bcrypt from "bcrypt";
import { AuthenticatedRequest } from "../utils/types.js";
import "dotenv/config";
import {
  HTTP_FORBIDDEN,
  HTTP_NOT_FOUND,
  HTTP_OK,
  HTTP_SERVER_ERROR,
} from "../utils/status.js";
import db from "../db.js";
import { users, selectUserSchema, insertUserSchema } from "../schema.js";
import { eq } from "drizzle-orm";

const router = express.Router();

router.get(
  "/",
  auth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (req.role !== "admin") {
        return res.status(HTTP_FORBIDDEN).json({ message: "Non autorisé" });
      }
      const allUsers = await db.select().from(users);
      return res.status(HTTP_OK).json(allUsers);
    } catch (error: any) {
      console.error(error.message);
      return res.status(HTTP_SERVER_ERROR).json({ error });
    }
  }
);

router.get(
  "/id/:id",
  auth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (
        req.role !== "admin" ||
        req.params.id.toString() !== req.user.toString()
      ) {
        return res.status(HTTP_FORBIDDEN).json({ message: "Non autorisé" });
      }
      const allUsers = await db
        .select()
        .from(users)
        .where(eq(users.id, req.params.id));
      if (allUsers.length === 0) {
        return res
          .status(HTTP_NOT_FOUND)
          .json({ message: "Utilisateur non trouvé" });
      }
      return res.status(HTTP_OK).json({ user: allUsers[0] });
    } catch (error: any) {
      console.error(error.message);
      return res.status(HTTP_SERVER_ERROR).json({ error });
    }
  }
);

router.get(
  "/auth",
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const jwtToken = req.header("token");
      if (!jwtToken) {
        return res.status(HTTP_FORBIDDEN).json({ message: "Pas de token" });
      }
      jwt.verify(
        jwtToken,
        process.env.jwtSecret!,
        async function (err, payload) {
          if (err) {
            return res.status(HTTP_FORBIDDEN).json({ message: "Non autorisé" });
          }
          const allUsers = await db
            .select()
            .from(users)
            .where(eq(users.id, (payload as JwtPayload).userId));
          if (allUsers.length === 0) {
            return res
              .status(HTTP_NOT_FOUND)
              .json({ message: "Utilisateur non trouvé" });
          }
          return res.status(HTTP_OK).json({ user: allUsers[0] });
        }
      );
    } catch (error: any) {
      console.error(error.message);
      return res.status(HTTP_SERVER_ERROR).json({ error });
    }
  }
);

router.post("/login", async (req, res) => {
  try {
    const allUsers = await db
      .select()
      .from(users)
      .where(eq(users.mail, req.body.mail));
    if (allUsers.length === 0) {
      const user = insertUserSchema.parse(req.body);
      await db.insert(users).values(user);
    }
    const user = allUsers[0];
    const token = jwtGenerator(user.id, user.role, user.mail);
    return res.status(HTTP_OK).json({ user, token });
  } catch (error) {
    console.error(error);
    return res.sendStatus(HTTP_SERVER_ERROR);
  }
});

router.post(
  "/connect",
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { mail, password } = req.body;
      const allUsers = await db
        .select()
        .from(users)
        .where(eq(mail, users.mail));
      if (allUsers.length === 0) {
        return res
          .status(HTTP_NOT_FOUND)
          .json({ message: "Utilisateur non trouvé" });
      }
      const user = allUsers[0];
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res
          .status(HTTP_FORBIDDEN)
          .json({ message: "Mot de passe erroné" });
      }
      const token = jwtGenerator(user.id, user.role, user.mail);
      return res.status(HTTP_OK).json({ user, token });
    } catch (error: any) {
      console.error(error.message);
      return res.status(HTTP_SERVER_ERROR).json({ error });
    }
  }
);

router.put(
  "/id/:id",
  auth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (req.role !== "admin") {
        return res.status(HTTP_FORBIDDEN).json({ message: "Non autorisé" });
      }
      const allUsers = await db
        .select()
        .from(users)
        .where(eq(users.id, req.params.id));
      if (allUsers.length === 0) {
        return res
          .status(HTTP_NOT_FOUND)
          .json({ message: "Utilisateur non trouvé" });
      }
      const user = insertUserSchema.parse(req.body);
      await db.update(users).set(user);
      return res.status(HTTP_OK).json({ message: "Utilisateur modifié !" });
    } catch (error: any) {
      console.error(error.message);
      return res.status(HTTP_SERVER_ERROR).json({ error });
    }
  }
);

export default router;