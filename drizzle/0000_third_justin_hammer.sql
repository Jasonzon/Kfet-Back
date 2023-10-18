DO $$ BEGIN
 CREATE TYPE "role" AS ENUM('basic', 'admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "articles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"nom" text,
	"prix" numeric,
	"image" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"nom" text,
	"prenom" text,
	"tel" varchar(256),
	"mail" varchar(256),
	"role" "role"
);
