import { InferInsertModel, InferSelectModel, sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  varchar,
  pgEnum,
  timestamp,
  real,
  integer,
} from "drizzle-orm/pg-core";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";

export const role = pgEnum("role", ["basic", "admin"]);

export const users = pgTable("users", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  nom: text("nom").notNull(),
  prenom: text("prenom").notNull(),
  tel: varchar("tel", { length: 256 }).notNull(),
  mail: varchar("mail", { length: 256 }).notNull(),
  role: role("role").notNull(),
  password: text("password").notNull(),
  tampons: integer("tampons").default(0).notNull(),
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
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  nom: text("nom").notNull(),
  prix: real("prix").notNull(),
  image: text("image").notNull(),
});

export type Article = InferSelectModel<typeof articles>;
export type NewArticle = InferInsertModel<typeof articles>;
export const selectArticleSchema = createSelectSchema(articles);
export const insertArticleSchema = createInsertSchema(articles);

export const paiements = pgTable("paiements", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  user: uuid("user")
    .references(() => users.id)
    .notNull(),
  vendeur: uuid("vendeur").references(() => users.id),
  articles: uuid("articles")
    .references(() => articles.id)
    .array()
    .notNull(),
  montant: real("montant").notNull(),
  envoi: timestamp("envoi").defaultNow(),
  validation: timestamp("validation"),
});

export type Paiement = InferSelectModel<typeof paiements>;
export type NewPaiement = InferInsertModel<typeof paiements>;
export const selectPaiementSchema = createSelectSchema(paiements);
export const insertPaiementSchema = createInsertSchema(paiements);
export const newPaiementSchema = insertPaiementSchema.pick({
  articles: true,
  montant: true,
});

export const presences = pgTable("presences", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  user: uuid("user")
    .references(() => users.id)
    .notNull(),
  debut: timestamp("debut").defaultNow(),
  fin: timestamp("fin"),
});

export type Presence = InferSelectModel<typeof presences>;
export type NewPresence = InferInsertModel<typeof presences>;
export const selectPresenceSchema = createSelectSchema(presences);
export const insertPresenceSchema = createInsertSchema(presences);
