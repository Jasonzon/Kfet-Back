ALTER TABLE "paiements" ALTER COLUMN "articles" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "paiements" ALTER COLUMN "envoi" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "paiements" ALTER COLUMN "envoi" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "paiements" ALTER COLUMN "envoi" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "paiements" ALTER COLUMN "validation" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "presences" ALTER COLUMN "debut" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "presences" ALTER COLUMN "debut" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "presences" ALTER COLUMN "debut" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "presences" ALTER COLUMN "fin" SET DATA TYPE timestamp;