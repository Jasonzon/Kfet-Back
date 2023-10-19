CREATE TABLE IF NOT EXISTS "paiements" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user" uuid NOT NULL,
	"article" uuid NOT NULL,
	"envoi" date NOT NULL,
	"validation" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "presences" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user" uuid NOT NULL,
	"debut" date NOT NULL,
	"fin" date
);
--> statement-breakpoint
ALTER TABLE "articles" ALTER COLUMN "nom" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ALTER COLUMN "prix" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ALTER COLUMN "image" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "nom" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "prenom" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "tel" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "mail" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "tampons" numeric DEFAULT '0' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "paiements" ADD CONSTRAINT "paiements_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "paiements" ADD CONSTRAINT "paiements_article_articles_id_fk" FOREIGN KEY ("article") REFERENCES "articles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "presences" ADD CONSTRAINT "presences_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
