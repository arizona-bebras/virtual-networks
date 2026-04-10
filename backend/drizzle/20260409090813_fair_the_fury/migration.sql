CREATE TABLE "devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL,
	"ip" varchar(17) NOT NULL UNIQUE,
	"config" text NOT NULL,
	"network_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "devices_tags" (
	"device_id" uuid,
	"tag_id" uuid,
	CONSTRAINT "devices_tags_pkey" PRIMARY KEY("device_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "networks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL,
	"description" varchar(255) NOT NULL,
	"ip" varchar(15) NOT NULL,
	"subnet" integer NOT NULL,
	"config" text NOT NULL,
	"admin_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL UNIQUE,
	"rules" jsonb,
	"network_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL UNIQUE,
	"email" varchar(255) NOT NULL UNIQUE
);
--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_network_id_networks_id_fkey" FOREIGN KEY ("network_id") REFERENCES "networks"("id");--> statement-breakpoint
ALTER TABLE "devices_tags" ADD CONSTRAINT "devices_tags_device_id_devices_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id");--> statement-breakpoint
ALTER TABLE "devices_tags" ADD CONSTRAINT "devices_tags_tag_id_tags_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id");--> statement-breakpoint
ALTER TABLE "networks" ADD CONSTRAINT "networks_admin_id_users_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_network_id_networks_id_fkey" FOREIGN KEY ("network_id") REFERENCES "networks"("id");