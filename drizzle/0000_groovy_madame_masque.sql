CREATE TYPE "public"."couple_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."name_gender" AS ENUM('girl', 'boy', 'neutral', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."parent_role" AS ENUM('mother', 'father');--> statement-breakpoint
CREATE TYPE "public"."swipe_direction" AS ENUM('like', 'pass');--> statement-breakpoint
CREATE TABLE "baby_names" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"gender" "name_gender" DEFAULT 'unknown' NOT NULL,
	"origin" text,
	"meaning" text,
	"popularity_rank" integer,
	"source" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "couple_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"couple_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "parent_role" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "couples" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invite_code" text NOT NULL,
	"status" "couple_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"couple_id" uuid NOT NULL,
	"baby_name_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "swipes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"couple_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"baby_name_id" uuid NOT NULL,
	"direction" "swipe_direction" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"email" text,
	"display_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "couple_members" ADD CONSTRAINT "couple_members_couple_id_couples_id_fk" FOREIGN KEY ("couple_id") REFERENCES "public"."couples"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "couple_members" ADD CONSTRAINT "couple_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_couple_id_couples_id_fk" FOREIGN KEY ("couple_id") REFERENCES "public"."couples"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_baby_name_id_baby_names_id_fk" FOREIGN KEY ("baby_name_id") REFERENCES "public"."baby_names"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swipes" ADD CONSTRAINT "swipes_couple_id_couples_id_fk" FOREIGN KEY ("couple_id") REFERENCES "public"."couples"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swipes" ADD CONSTRAINT "swipes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swipes" ADD CONSTRAINT "swipes_baby_name_id_baby_names_id_fk" FOREIGN KEY ("baby_name_id") REFERENCES "public"."baby_names"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "baby_names_normalized_name_idx" ON "baby_names" USING btree ("normalized_name");--> statement-breakpoint
CREATE INDEX "baby_names_popularity_idx" ON "baby_names" USING btree ("popularity_rank");--> statement-breakpoint
CREATE UNIQUE INDEX "couple_members_user_active_couple_idx" ON "couple_members" USING btree ("user_id") WHERE "couple_members"."is_active" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "couple_members_couple_role_idx" ON "couple_members" USING btree ("couple_id","role") WHERE "couple_members"."is_active" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "couple_members_couple_user_idx" ON "couple_members" USING btree ("couple_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "couples_invite_code_idx" ON "couples" USING btree ("invite_code");--> statement-breakpoint
CREATE UNIQUE INDEX "matches_unique_couple_name_idx" ON "matches" USING btree ("couple_id","baby_name_id");--> statement-breakpoint
CREATE UNIQUE INDEX "swipes_unique_user_name_idx" ON "swipes" USING btree ("couple_id","user_id","baby_name_id");--> statement-breakpoint
CREATE INDEX "swipes_couple_name_idx" ON "swipes" USING btree ("couple_id","baby_name_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_clerk_user_id_idx" ON "users" USING btree ("clerk_user_id");