import { boolean, index, integer, jsonb, pgTable, primaryKey, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import type { CostSettings, EffectSettings, Question } from "@partile/core";

/** Postgres schema (PGlite in development, Neon in production). Identifiers are text ids generated in code. */

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull().default(""),
  bio: text("bio"),
  birthday: text("birthday"),
  notifications: boolean("notifications").notNull().default(true),
  onboarded: boolean("onboarded").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const verificationCodes = pgTable(
  "verification_codes",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    code: text("code").notNull(),
    purpose: text("purpose").notNull(), // login | rsvp
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("verification_codes_email_idx").on(t.email)],
);

export type LocationJson = { name?: string; address?: string; district?: string; display: "district" | "full"; lat?: number; lng?: number };

export const plans = pgTable("plans", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id),
  status: text("status").notNull().default("draft"), // draft | published | cancelled
  title: text("title").notNull(),
  titleFont: text("title_font").notNull().default("klasik"),
  themeId: text("theme_id").notNull().default("kor"),
  posterUrl: text("poster_url"),
  posterText: text("poster_text"),
  description: text("description"),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  dateTbd: boolean("date_tbd").notNull().default(false),
  location: jsonb("location").$type<LocationJson>(),
  visibility: text("visibility").notNull().default("private"),
  capacity: integer("capacity"),
  plusOnesMax: integer("plus_ones_max").notNull().default(0),
  requirePlusOneNames: boolean("require_plus_one_names").notNull().default(false),
  requireApproval: boolean("require_approval").notNull().default(false),
  allowMaybe: boolean("allow_maybe").notNull().default(true),
  rsvpStyle: text("rsvp_style").notNull().default("icons"),
  effect: jsonb("effect").$type<EffectSettings>(),
  guestsCanInviteMutuals: boolean("guests_can_invite_mutuals").notNull().default(true),
  remindersEnabled: boolean("reminders_enabled").notNull().default(true),
  showGuestNames: boolean("show_guest_names").notNull().default(true),
  showGuestCount: boolean("show_guest_count").notNull().default(true),
  showTimestamps: boolean("show_timestamps").notNull().default(true),
  albumGuestsCanUpload: boolean("album_guests_can_upload").notNull().default(true),
  albumFilter: text("album_filter").notNull().default("none"),
  questions: jsonb("questions").$type<Question[]>().notNull().default([]),
  cost: jsonb("cost").$type<CostSettings>().notNull().default({ mode: "off" }),
  extras: jsonb("extras").$type<Record<string, unknown>>(),
  views: integer("views").notNull().default(0),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const planHosts = pgTable(
  "plan_hosts",
  {
    planId: text("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    role: text("role").notNull().default("cohost"), // owner | cohost
    accepted: boolean("accepted").notNull().default(true),
    position: integer("position").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.planId, t.userId] })],
);

/** One row per person per plan: an RSVP, a pending approval, or an invite that has not answered yet. */
export const guests = pgTable(
  "guests",
  {
    id: text("id").primaryKey(),
    planId: text("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id),
    /** Stored for codes and reminders only; never returned to hosts. */
    email: text("email"),
    name: text("name").notNull(),
    status: text("status").notNull().default("invited"), // going | maybe | no | invited | pending
    plusOnes: integer("plus_ones").notNull().default(0),
    plusOneNames: jsonb("plus_one_names").$type<string[]>(),
    note: text("note"),
    answers: jsonb("answers").$type<Record<string, string>>(),
    checkedIn: boolean("checked_in").notNull().default(false),
    paid: boolean("paid").notNull().default(false),
    followHost: boolean("follow_host").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("guests_plan_idx").on(t.planId), uniqueIndex("guests_plan_user_idx").on(t.planId, t.userId)],
);

export const pollOptions = pgTable("poll_options", {
  id: text("id").primaryKey(),
  planId: text("plan_id")
    .notNull()
    .references(() => plans.id, { onDelete: "cascade" }),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  position: integer("position").notNull().default(0),
});

export const pollVotes = pgTable(
  "poll_votes",
  {
    optionId: text("option_id")
      .notNull()
      .references(() => pollOptions.id, { onDelete: "cascade" }),
    guestId: text("guest_id")
      .notNull()
      .references(() => guests.id, { onDelete: "cascade" }),
    vote: text("vote").notNull(), // yes | maybe | no
  },
  (t) => [primaryKey({ columns: [t.optionId, t.guestId] })],
);

export const feedItems = pgTable(
  "feed_items",
  {
    id: text("id").primaryKey(),
    planId: text("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    /** Guest row for RSVPs/comments, or the host's user id for blasts (kind tells which). */
    actorId: text("actor_id").notNull(),
    kind: text("kind").notNull(), // rsvp | comment | blast
    text: text("text"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("feed_items_plan_idx").on(t.planId)],
);

export const blasts = pgTable("blasts", {
  id: text("id").primaryKey(),
  planId: text("plan_id")
    .notNull()
    .references(() => plans.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  toLabel: text("to_label").notNull(),
  count: integer("count").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notifications = pgTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    planId: text("plan_id").references(() => plans.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    text: text("text").notNull(),
    actorName: text("actor_name").notNull().default(""),
    role: text("role").notNull().default("guest"), // host | guest
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("notifications_user_idx").on(t.userId)],
);

/** A plan-scoped thread between one host and one guest (no group chat). */
export const conversations = pgTable(
  "conversations",
  {
    id: text("id").primaryKey(),
    planId: text("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    hostId: text("host_id")
      .notNull()
      .references(() => users.id),
    guestId: text("guest_id")
      .notNull()
      .references(() => users.id),
    lastAt: timestamp("last_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("conversations_plan_pair_idx").on(t.planId, t.hostId, t.guestId), index("conversations_host_idx").on(t.hostId), index("conversations_guest_idx").on(t.guestId)],
);

export const messages = pgTable(
  "messages",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => users.id),
    text: text("text").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("messages_conversation_idx").on(t.conversationId)],
);

/** Album photos (host and guests who answered). Files live in blob storage; only the URL is stored. */
export const photos = pgTable(
  "photos",
  {
    id: text("id").primaryKey(),
    planId: text("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    url: text("url").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("photos_plan_idx").on(t.planId)],
);

/** One row per plan per reminder kind so the cron never sends twice. */
export const reminderLog = pgTable(
  "reminder_log",
  {
    planId: text("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(), // rsvp | event
    sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
    count: integer("count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.planId, t.kind] })],
);

/** A user muted a plan: no blast or reminder notifications/e-mails (hosts: no RSVP notifications). Cancellations still arrive. */
export const planMutes = pgTable(
  "plan_mutes",
  {
    planId: text("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.planId, t.userId] })],
);

/** Follower gets an in-app notification when the followed host publishes a public plan. */
export const follows = pgTable(
  "follows",
  {
    followerId: text("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followeeId: text("followee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.followerId, t.followeeId] }), index("follows_followee_idx").on(t.followeeId)],
);

/** "Sonra hatırlat": one e-mail + notification at `remindAt` unless the user answered by then. */
export const laterReminders = pgTable(
  "later_reminders",
  {
    planId: text("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    remindAt: timestamp("remind_at", { withTimezone: true }).notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.planId, t.userId] }), index("later_reminders_due_idx").on(t.remindAt)],
);
