CREATE TYPE "protocol" AS ENUM('TCP', 'UDP', 'ICMP', 'SCTP', 'DCCP', 'UDP-Lite', 'AH', 'ESP');--> statement-breakpoint
ALTER TABLE "rules" ADD COLUMN "description" varchar(255);--> statement-breakpoint
ALTER TABLE "devices" ALTER COLUMN "owner_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "rules" ALTER COLUMN "protocol" SET DATA TYPE "protocol" USING "protocol"::"protocol";