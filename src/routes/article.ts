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
import { articles, insertArticleSchema } from "../schema.js";
import { eq } from "drizzle-orm";

const router = express.Router();

router.get(
  "/",
  auth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const allArticles = await db.select().from(articles);
      return res.status(HTTP_OK).json(allArticles);
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
      const allArticles = await db
        .select()
        .from(articles)
        .where(eq(articles.id, req.params.id));
      if (allArticles.length === 0) {
        return res
          .status(HTTP_NOT_FOUND)
          .json({ message: "Article non trouvé" });
      }
      return res.status(HTTP_OK).json({ article: allArticles[0] });
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
      const article = insertArticleSchema.parse(req.body);
      await db.insert(articles).values(article);
      return res.status(HTTP_OK).json({ message: "Article ajouté !" });
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
      const allArticles = await db
        .select()
        .from(articles)
        .where(eq(articles.id, req.params.id));
      if (allArticles.length === 0) {
        return res
          .status(HTTP_NOT_FOUND)
          .json({ message: "Article non trouvé" });
      }
      const article = insertArticleSchema.parse(req.body);
      await db.update(articles).set(article);
      return res.status(HTTP_OK).json({ message: "Article modifié !" });
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
      if (req.role !== "admin") {
        return res.status(HTTP_FORBIDDEN).json({ message: "Non autorisé" });
      }
      const { id } = req.params;
      await db.delete(articles).where(eq(articles.id, id));
    } catch (error: any) {
      console.error(error.message);
      return res.status(HTTP_SERVER_ERROR).json({ error });
    }
  }
);

export default router;
