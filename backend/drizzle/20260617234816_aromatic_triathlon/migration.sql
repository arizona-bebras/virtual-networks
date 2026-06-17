ALTER TABLE "tags" DROP CONSTRAINT "tags_name_key";--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "network_tag_name_unique_idx" UNIQUE("network_id","name");