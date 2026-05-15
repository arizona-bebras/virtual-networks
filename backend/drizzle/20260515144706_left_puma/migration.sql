CREATE TYPE "protocol" AS ENUM('TCP', 'UDP', 'ICMP');--> statement-breakpoint
ALTER TABLE "rules" RENAME COLUMN "source" TO "source_id";--> statement-breakpoint
ALTER TABLE "rules" RENAME COLUMN "dest" TO "dest_id";--> statement-breakpoint
ALTER TABLE "networks" ADD COLUMN "creator_id" text;--> statement-breakpoint
ALTER TABLE "rules" ADD COLUMN "description" varchar(255);--> statement-breakpoint
ALTER TABLE "devices" ALTER COLUMN "owner_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "rules" ALTER COLUMN "protocol" SET DATA TYPE "protocol" USING "protocol"::"protocol";--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_ip_key" UNIQUE("ip");--> statement-breakpoint
ALTER TABLE "networks" ADD CONSTRAINT "networks_creator_id_user_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "user"("id");