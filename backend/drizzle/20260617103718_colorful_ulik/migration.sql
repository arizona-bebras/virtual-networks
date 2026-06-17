ALTER TABLE "events" ADD COLUMN "entity_object_id" uuid;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "action" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "entity" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "updated_fields" SET DATA TYPE jsonb USING "updated_fields"::jsonb;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "time" SET NOT NULL;