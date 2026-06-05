CREATE TYPE "color" AS ENUM('red', 'green', 'blue', 'yellow', 'purple', 'orange');--> statement-breakpoint
CREATE TYPE "protocol" AS ENUM('TCP', 'UDP', 'ICMP');--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"ip" inet NOT NULL,
	"owner_id" text NOT NULL,
	"network_id" uuid NOT NULL,
	"keys_id" uuid,
	CONSTRAINT "network_ip_unique_idx" UNIQUE("ip","network_id")
);
--> statement-breakpoint
CREATE TABLE "devices_tags" (
	"device_id" uuid,
	"tag_id" uuid,
	CONSTRAINT "devices_tags_pkey" PRIMARY KEY("device_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "jwks" (
	"id" text PRIMARY KEY,
	"public_key" text NOT NULL,
	"private_key" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"public_key" bytea,
	"private_key" bytea
);
--> statement-breakpoint
CREATE TABLE "network_users" (
	"network_id" uuid,
	"user_id" text,
	"role" "user_role" DEFAULT 'user'::"user_role",
	CONSTRAINT "network_users_pkey" PRIMARY KEY("network_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "networks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL,
	"domain" varchar(63) NOT NULL,
	"description" varchar(255) NOT NULL,
	"cidr" cidr DEFAULT '192.168.123.0/24' NOT NULL,
	"creator_id" text,
	"keys_id" uuid
);
--> statement-breakpoint
CREATE TABLE "peer_states" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"is_online" boolean NOT NULL,
	"last_handshake_time" timestamp,
	"bytes_received" bigint NOT NULL,
	"bytes_sent" bigint NOT NULL,
	"device_id" uuid NOT NULL UNIQUE,
	"network_id" uuid NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"source_id" uuid,
	"dest_id" uuid,
	"description" varchar(255) NOT NULL,
	"protocol" "protocol",
	"port" integer,
	"network_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL UNIQUE,
	"color" "color",
	"network_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_owner_id_user_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_network_id_networks_id_fkey" FOREIGN KEY ("network_id") REFERENCES "networks"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_keys_id_keys_id_fkey" FOREIGN KEY ("keys_id") REFERENCES "keys"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "devices_tags" ADD CONSTRAINT "devices_tags_device_id_devices_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "devices_tags" ADD CONSTRAINT "devices_tags_tag_id_tags_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "network_users" ADD CONSTRAINT "network_users_network_id_networks_id_fkey" FOREIGN KEY ("network_id") REFERENCES "networks"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "network_users" ADD CONSTRAINT "network_users_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "networks" ADD CONSTRAINT "networks_creator_id_user_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "networks" ADD CONSTRAINT "networks_keys_id_keys_id_fkey" FOREIGN KEY ("keys_id") REFERENCES "keys"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "peer_states" ADD CONSTRAINT "peer_states_device_id_devices_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "peer_states" ADD CONSTRAINT "peer_states_network_id_networks_id_fkey" FOREIGN KEY ("network_id") REFERENCES "networks"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "rules" ADD CONSTRAINT "rules_source_id_tags_id_fkey" FOREIGN KEY ("source_id") REFERENCES "tags"("id");--> statement-breakpoint
ALTER TABLE "rules" ADD CONSTRAINT "rules_dest_id_tags_id_fkey" FOREIGN KEY ("dest_id") REFERENCES "tags"("id");--> statement-breakpoint
ALTER TABLE "rules" ADD CONSTRAINT "rules_network_id_networks_id_fkey" FOREIGN KEY ("network_id") REFERENCES "networks"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_network_id_networks_id_fkey" FOREIGN KEY ("network_id") REFERENCES "networks"("id") ON DELETE CASCADE;