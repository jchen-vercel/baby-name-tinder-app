CREATE TYPE "public"."name_preference" AS ENUM('boy', 'girl');--> statement-breakpoint
ALTER TABLE "couple_members" ADD COLUMN "name_preference" "name_preference" DEFAULT 'girl' NOT NULL;