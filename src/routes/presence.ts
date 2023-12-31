import express, { Response, NextFunction } from "express";
import { auth } from "../utils/auth.js";
import { AuthenticatedRequest } from "../utils/types.js";
import "dotenv/config";
import {
  HTTP_FORBIDDEN,
  HTTP_NOT_FOUND,
  HTTP_OK,
  HTTP_SERVER_ERROR,
} from "../utils/status.js";
import db from "../db.js";
import { presences } from "../schema.js";
import { eq, isNull } from "drizzle-orm";

const router = express.Router();

router.get(
  "/",
  auth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const allPresences = await db
        .select()
        .from(presences)
        .where(isNull(presences.fin));
      return res.status(HTTP_OK).json(allPresences);
    } catch (error: any) {
      console.error(error.message);
      return res.status(HTTP_SERVER_ERROR).json({ error });
    }
  }
);

router.post(
  "/",
  auth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (req.role !== "admin") {
        return res.status(HTTP_FORBIDDEN).json({ message: "Non autorisé" });
      }
      await db.insert(presences).values({ user: req.user });
      return res.status(HTTP_OK).json({ message: "Presence ajouté !" });
    } catch (error: any) {
      console.error(error.message);
      return res.status(HTTP_SERVER_ERROR).json({ error });
    }
  }
);

router.put(
  "/:id",
  auth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (req.role !== "admin") {
        return res.status(HTTP_FORBIDDEN).json({ message: "Non autorisé" });
      }
      const allPresences = await db
        .select()
        .from(presences)
        .where(eq(presences.id, req.params.id));
      if (allPresences.length === 0) {
        return res
          .status(HTTP_NOT_FOUND)
          .json({ message: "Presence non trouvé" });
      }
      await db
        .update(presences)
        .set({ fin: new Date() })
        .where(eq(presences.id, req.params.id));
      return res.status(HTTP_OK).json({ message: "Presence modifié !" });
    } catch (error: any) {
      console.error(error.message);
      return res.status(HTTP_SERVER_ERROR).json({ error });
    }
  }
);

router.delete(
  "/:id",
  auth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (req.role !== "admin") {
        return res.status(HTTP_FORBIDDEN).json({ message: "Non autorisé" });
      }
      const { id } = req.params;
      await db.delete(presences).where(eq(presences.id, id));
      return res.status(HTTP_OK).json({ message: "Deleted !" });
    } catch (error: any) {
      console.error(error.message);
      return res.status(HTTP_SERVER_ERROR).json({ error });
    }
  }
);

export default router;
