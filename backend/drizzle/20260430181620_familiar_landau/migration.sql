ALTER TABLE "networks" ADD COLUMN "creator_id" text;--> statement-breakpoint
ALTER TABLE "devices" ALTER COLUMN "owner_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "networks" ADD CONSTRAINT "networks_creator_id_user_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "user"("id");