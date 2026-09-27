CREATE TABLE "plan_code_aliases" (
	"code" text PRIMARY KEY NOT NULL,
	"plan_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "plan_code_aliases" ADD CONSTRAINT "plan_code_aliases_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "plan_code_aliases_plan_idx" ON "plan_code_aliases" USING btree ("plan_id");