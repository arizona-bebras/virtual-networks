CREATE TABLE "rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"source" uuid NOT NULL,
	"dest" uuid NOT NULL,
	"port" integer NOT NULL,
	"network_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rules" ADD CONSTRAINT "rules_source_tags_id_fkey" FOREIGN KEY ("source") REFERENCES "tags"("id");--> statement-breakpoint
ALTER TABLE "rules" ADD CONSTRAINT "rules_dest_tags_id_fkey" FOREIGN KEY ("dest") REFERENCES "tags"("id");--> statement-breakpoint
ALTER TABLE "rules" ADD CONSTRAINT "rules_network_id_networks_id_fkey" FOREIGN KEY ("network_id") REFERENCES "networks"("id");