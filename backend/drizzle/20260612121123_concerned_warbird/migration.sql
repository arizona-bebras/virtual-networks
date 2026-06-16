CREATE TYPE "actions" AS ENUM('create', 'update', 'delete');--> statement-breakpoint
CREATE TYPE "entities" AS ENUM('network', 'device', 'rule', 'tag');--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"action" "actions",
	"entity" "entities",
	"updated_fields" json,
	"user_id" text,
	"time" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");