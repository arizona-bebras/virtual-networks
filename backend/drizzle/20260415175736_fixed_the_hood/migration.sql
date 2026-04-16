ALTER TABLE "rules" ALTER COLUMN "source" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "rules" ALTER COLUMN "dest" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "rules" ALTER COLUMN "protocol" DROP NOT NULL;