import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  varchar,
  pgEnum,
  numeric,
} from "drizzle-orm/pg-core";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";

export const role = pgEnum("role", ["basic", "admin"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  nom: text("nom").notNull(),
  prenom: text("prenom").notNull(),
  tel: varchar("tel", { length: 256 }).notNull(),
  mail: varchar("mail", { length: 256 }).notNull(),
  role: role("role").notNull(),
  password: text("password").notNull(),
});

export const articles = pgTable("articles", {
  id: uuid("id").primaryKey(),
  nom: text("nom").notNull(),
  prix: numeric("prix").notNull(),
  image: text("image").notNull(),
});

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export const selectUserSchema = createSelectSchema(users);
export const insertUserSchema = createInsertSchema(users);

export type Article = InferSelectModel<typeof articles>;
export type NewArticle = InferInsertModel<typeof articles>;
export const selectArticleSchema = createSelectSchema(articles);
export const insertArticleSchema = createInsertSchema(articles);
