CREATE TYPE "user_role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE "network_users" (
	"network_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" "user_role" DEFAULT 'user'::"user_role"
);
--> statement-breakpoint
ALTER TABLE "networks" DROP CONSTRAINT "networks_admin_id_user_id_fkey";--> statement-breakpoint
ALTER TABLE "devices" DROP CONSTRAINT "devices_ip_key";--> statement-breakpoint
ALTER TABLE "devices" ADD COLUMN "owner_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "networks" DROP COLUMN "subnet";--> statement-breakpoint
ALTER TABLE "networks" DROP COLUMN "admin_id";--> statement-breakpoint
ALTER TABLE "devices" ALTER COLUMN "ip" SET DATA TYPE inet USING "ip"::inet;--> statement-breakpoint
ALTER TABLE "networks" ALTER COLUMN "ip" SET DATA TYPE inet USING "ip"::inet;--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_owner_id_user_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "network_users" ADD CONSTRAINT "network_users_network_id_networks_id_fkey" FOREIGN KEY ("network_id") REFERENCES "networks"("id");--> statement-breakpoint
ALTER TABLE "network_users" ADD CONSTRAINT "network_users_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");