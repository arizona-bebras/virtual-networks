ALTER TABLE "networks" RENAME COLUMN "ip" TO "cidr";--> statement-breakpoint
ALTER TABLE "networks" ALTER COLUMN "cidr" SET DATA TYPE cidr USING "cidr"::cidr;--> statement-breakpoint
ALTER TABLE "networks" ALTER COLUMN "cidr" SET DEFAULT '192.168.123.0/24';