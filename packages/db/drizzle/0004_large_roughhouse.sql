CREATE TABLE "reminder_log" (
	"plan_id" text NOT NULL,
	"kind" text NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "reminder_log_plan_id_kind_pk" PRIMARY KEY("plan_id","kind")
);
--> statement-breakpoint
ALTER TABLE "reminder_log" ADD CONSTRAINT "reminder_log_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;