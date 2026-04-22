CREATE TYPE "color" AS ENUM('red', 'green', 'blue', 'yellow', 'purple', 'orange');--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "color" "color";