import { InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  varchar,
  pgEnum,
  numeric,
} from "drizzle-orm/pg-core";

export const role = pgEnum("role", ["basic", "admin"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  nom: text("nom"),
  prenom: text("prenom"),
  tel: varchar("tel", { length: 256 }),
  mail: varchar("mail", { length: 256 }),
  role: role("role"),
});

export const articles = pgTable("articles", {
  id: uuid("id").primaryKey(),
  nom: text("nom"),
  prix: numeric("prix"),
  image: text("image"),
});

export type User = InferSelectModel<typeof users>;
export type Article = InferSelectModel<typeof articles>;
