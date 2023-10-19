ALTER TABLE "paiements" ADD COLUMN "vendeur" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "paiements" ADD CONSTRAINT "paiements_vendeur_users_id_fk" FOREIGN KEY ("vendeur") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
