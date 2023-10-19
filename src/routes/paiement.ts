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
import { paiements, insertPaiementSchema } from "../schema.js";
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
      const allPaiements = await db.select().from(paiements);
      return res.status(HTTP_OK).json(allPaiements);
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
      const paiement = insertPaiementSchema.parse({
        ...req.body,
        user: req.user,
      });
      await db.insert(paiements).values(paiement);
      return res.status(HTTP_OK).json({ message: "Paiement ajouté !" });
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
      const allPaiements = await db
        .select()
        .from(paiements)
        .where(eq(paiements.id, req.params.id));
      if (allPaiements.length === 0) {
        return res
          .status(HTTP_NOT_FOUND)
          .json({ message: "Paiement non trouvé" });
      }
      const paiement = insertPaiementSchema.parse(req.body);
      await db.update(paiements).set(paiement);
      return res.status(HTTP_OK).json({ message: "Paiement modifié !" });
    } catch (error: any) {
      console.error(error.message);
      return res.status(HTTP_SERVER_ERROR).json({ error });
    }
  }
);

router.delete(
  "/:id",
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (req.user.toString() !== req.body.user.toString()) {
        return res.status(HTTP_FORBIDDEN).json({ message: "Non autorisé" });
      }
      const { id } = req.params;
      await db.delete(paiements).where(eq(paiements.id, id));
    } catch (error: any) {
      console.error(error.message);
      return res.status(HTTP_SERVER_ERROR).json({ error });
    }
  }
);

export default router;
