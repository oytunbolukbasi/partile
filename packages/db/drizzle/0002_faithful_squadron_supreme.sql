ALTER TABLE "plans" ADD COLUMN "rsvp_style" text DEFAULT 'icons' NOT NULL;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "effect" jsonb;