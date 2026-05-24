CREATE TABLE "match_rankings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"couple_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"baby_name_id" uuid NOT NULL,
	"rank" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "match_rankings" ADD CONSTRAINT "match_rankings_couple_id_couples_id_fk" FOREIGN KEY ("couple_id") REFERENCES "public"."couples"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_rankings" ADD CONSTRAINT "match_rankings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_rankings" ADD CONSTRAINT "match_rankings_baby_name_id_baby_names_id_fk" FOREIGN KEY ("baby_name_id") REFERENCES "public"."baby_names"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "match_rankings_user_rank_slot_idx" ON "match_rankings" USING btree ("couple_id","user_id","rank");--> statement-breakpoint
CREATE UNIQUE INDEX "match_rankings_user_name_idx" ON "match_rankings" USING btree ("couple_id","user_id","baby_name_id");