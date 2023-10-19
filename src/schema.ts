import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  varchar,
  pgEnum,
  numeric,
  date,
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
  tampons: numeric("tampons").default("0").notNull(),
});

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export const selectUserSchema = createSelectSchema(users);
export const insertUserSchema = createInsertSchema(users);
export const connectUserSchema = selectUserSchema.pick({
  mail: true,
  password: true,
});

export const articles = pgTable("articles", {
  id: uuid("id").primaryKey(),
  nom: text("nom").notNull(),
  prix: numeric("prix").notNull(),
  image: text("image").notNull(),
});

export type Article = InferSelectModel<typeof articles>;
export type NewArticle = InferInsertModel<typeof articles>;
export const selectArticleSchema = createSelectSchema(articles);
export const insertArticleSchema = createInsertSchema(articles);

export const paiements = pgTable("paiements", {
  id: uuid("id").primaryKey(),
  user: uuid("user")
    .references(() => users.id)
    .notNull(),
  vendeur: uuid("vendeur").references(() => users.id),
  article: uuid("article")
    .references(() => articles.id)
    .notNull(),
  envoi: date("envoi").notNull(),
  validation: date("validation").notNull(),
});

export type Paiement = InferSelectModel<typeof paiements>;
export type NewPaiement = InferInsertModel<typeof paiements>;
export const selectPaiementSchema = createSelectSchema(paiements);
export const insertPaiementSchema = createInsertSchema(paiements);

export const presences = pgTable("presences", {
  id: uuid("id").primaryKey(),
  user: uuid("user")
    .references(() => users.id)
    .notNull(),
  debut: date("debut").notNull(),
  fin: date("fin"),
});

export type Presence = InferSelectModel<typeof presences>;
export type NewPresence = InferInsertModel<typeof presences>;
export const selectPresenceSchema = createSelectSchema(presences);
export const insertPresenceSchema = createInsertSchema(presences);
