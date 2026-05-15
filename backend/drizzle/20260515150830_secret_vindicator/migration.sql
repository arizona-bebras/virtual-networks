ALTER TABLE "devices" RENAME CONSTRAINT "devices_ip_key" TO "network_ip_unique_idx";--> statement-breakpoint
ALTER TABLE "devices" DROP CONSTRAINT "network_ip_unique_idx";--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "network_ip_unique_idx" UNIQUE("ip");