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
import {
  paiements,
  users,
  updatePaiementSchema,
  newPaiementSchema,
} from "../schema.js";
import { eq, sql } from "drizzle-orm";

const router = express.Router();

router.get(
  "/",
  auth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (req.role === "admin") {
        const allPaiements = await db
          .select({
            id: paiements.id,
            envoi: paiements.envoi,
            montant: paiements.montant,
            vendeur: paiements.vendeur,
            validation: paiements.validation,
            articles: paiements.articles,
            user: paiements.user,
            nom: users.nom,
            prenom: users.prenom,
            role: users.role,
            mail: users.mail,
            tel: users.tel,
            password: users.password,
            tampons: users.tampons,
          })
          .from(paiements)
          .innerJoin(users, eq(paiements.user, users.id));
        return res.status(HTTP_OK).json(allPaiements);
      }
      const userPaiements = await db
        .select({
          id: paiements.id,
          envoi: paiements.envoi,
          montant: paiements.montant,
          vendeur: paiements.vendeur,
          validation: paiements.validation,
          articles: paiements.articles,
          user: paiements.user,
          nom: users.nom,
          prenom: users.prenom,
          role: users.role,
          mail: users.mail,
          tel: users.tel,
          password: users.password,
          tampons: users.tampons,
        })
        .from(paiements)
        .innerJoin(users, eq(paiements.user, users.id))
        .where(eq(paiements.user, req.user));
      return res.status(HTTP_OK).json(userPaiements);
    } catch (error: any) {
      console.error(error.message);
      return res.status(HTTP_SERVER_ERROR).json({ error });
    }
  }
);

router.get(
  "/total",
  auth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const allPaiements = await db
        .select({
          user: paiements.user,
          total: sql<number>`sum(${paiements.montant})`.as("total"),
        })
        .from(paiements)
        .innerJoin(users, eq(users.id, paiements.user))
        .groupBy(paiements.user);
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
      const paiement = newPaiementSchema.parse({
        ...req.body,
      });
      await db.insert(paiements).values({ ...paiement, user: req.user });
      return res.status(HTTP_OK).json({ message: "Paiement ajouté !" });
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
      const allPaiements = await db
        .select()
        .from(paiements)
        .where(eq(paiements.id, req.params.id));
      if (allPaiements.length === 0) {
        return res
          .status(HTTP_NOT_FOUND)
          .json({ message: "Paiement non trouvé" });
      }
      const paiement = updatePaiementSchema.parse({ ...req.body });
      await db
        .update(paiements)
        .set(paiement)
        .where(eq(paiements.id, req.params.id));
      return res.status(HTTP_OK).json({ message: "Paiement modifié !" });
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
