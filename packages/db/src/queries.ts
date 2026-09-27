import { and, asc, desc, eq, inArray, or } from "drizzle-orm";
import { gradientFor, initials, type Guest, type Notification, type Plan, type PlanRole, type RsvpStatus } from "@partile/core";
import { getDb } from "./client";
import { blasts, feedItems, guests, notifications, planHosts, plans, pollOptions, pollVotes, users } from "./schema";

const isoOf = (d: Date | null | undefined) => (d ? d.toISOString() : undefined);

type PlanRow = typeof plans.$inferSelect;

/** Assemble the read model for one plan. Guest e-mails are never included. */
async function assemble(row: PlanRow): Promise<Plan> {
  const db = await getDb();
  const [hostRows, guestRows, feedRows, blastRows, optionRows] = await Promise.all([
    db.select({ userId: planHosts.userId, role: planHosts.role, accepted: planHosts.accepted, position: planHosts.position, name: users.name }).from(planHosts).innerJoin(users, eq(users.id, planHosts.userId)).where(eq(planHosts.planId, row.id)).orderBy(asc(planHosts.position)),
    db.select().from(guests).where(eq(guests.planId, row.id)).orderBy(desc(guests.createdAt)),
    db.select().from(feedItems).where(eq(feedItems.planId, row.id)).orderBy(desc(feedItems.createdAt)),
    db.select().from(blasts).where(eq(blasts.planId, row.id)).orderBy(asc(blasts.createdAt)),
    db.select().from(pollOptions).where(eq(pollOptions.planId, row.id)).orderBy(asc(pollOptions.position)),
  ]);

  let tally: Plan["pollVotes"];
  if (optionRows.length) {
    const votes = await db.select().from(pollVotes).where(inArray(pollVotes.optionId, optionRows.map((o) => o.id)));
    tally = Object.fromEntries(optionRows.map((o) => [o.id, { yes: 0, maybe: 0, no: 0 }]));
    for (const v of votes) {
      const t = tally[v.optionId];
      if (t && (v.vote === "yes" || v.vote === "maybe" || v.vote === "no")) t[v.vote] += 1;
    }
  }

  return {
    id: row.id,
    code: row.code,
    status: row.status as Plan["status"],
    title: row.title,
    titleFont: row.titleFont,
    themeId: row.themeId,
    posterUrl: row.posterUrl ?? undefined,
    posterText: row.posterText ?? undefined,
    description: row.description ?? undefined,
    startsAt: isoOf(row.startsAt),
    endsAt: isoOf(row.endsAt),
    dateTbd: row.dateTbd,
    poll: optionRows.length ? optionRows.map((o) => ({ id: o.id, startsAt: o.startsAt.toISOString(), endsAt: isoOf(o.endsAt) })) : undefined,
    location: row.location ?? undefined,
    visibility: row.visibility as Plan["visibility"],
    capacity: row.capacity ?? undefined,
    plusOnesMax: row.plusOnesMax,
    requirePlusOneNames: row.requirePlusOneNames,
    requireApproval: row.requireApproval,
    allowMaybe: row.allowMaybe,
    guestsCanInviteMutuals: row.guestsCanInviteMutuals,
    remindersEnabled: row.remindersEnabled,
    showGuestNames: row.showGuestNames,
    showGuestCount: row.showGuestCount,
    showTimestamps: row.showTimestamps,
    albumGuestsCanUpload: row.albumGuestsCanUpload,
    albumFilter: row.albumFilter as Plan["albumFilter"],
    questions: row.questions,
    cost: row.cost,
    extras: (row.extras as Plan["extras"]) ?? undefined,
    hosts: hostRows.map((h) => ({ id: h.userId, name: h.name, initials: initials(h.name), gradient: gradientFor(h.userId), accepted: h.accepted })),
    guests: guestRows.map(toGuest),
    feed: feedRows.map((f) => ({ id: f.id, guestId: f.actorId, kind: f.kind as "rsvp" | "comment" | "blast", text: f.text ?? undefined, at: f.createdAt.toISOString() })),
    blasts: blastRows.map((b) => ({ id: b.id, at: b.createdAt.toISOString(), to: b.toLabel, count: b.count, text: b.text })),
    views: row.views,
    pollVotes: tally,
    publishedAt: isoOf(row.publishedAt),
  };
}

const toGuest = (g: typeof guests.$inferSelect): Guest => ({
  id: g.id,
  name: g.name,
  initials: initials(g.name),
  gradient: gradientFor(g.userId ?? g.id),
  status: g.status as RsvpStatus,
  plusOnes: g.plusOnes || undefined,
  plusOneNames: g.plusOneNames ?? undefined,
  note: g.note ?? undefined,
  answers: g.answers ?? undefined,
  checkedIn: g.checkedIn || undefined,
  paid: g.paid || undefined,
  at: g.createdAt.toISOString(),
});

export async function getPlanByCode(code: string): Promise<Plan | null> {
  const db = await getDb();
  const [row] = await db.select().from(plans).where(eq(plans.code, code)).limit(1);
  return row ? assemble(row) : null;
}

export async function getPlanById(id: string): Promise<Plan | null> {
  const db = await getDb();
  const [row] = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
  return row ? assemble(row) : null;
}

/** "host" when the user hosts the plan, otherwise their RSVP status, or null when unrelated. */
export async function roleFor(planId: string, userId: string | null): Promise<PlanRole | null> {
  if (!userId) return null;
  const db = await getDb();
  const [h] = await db.select({ userId: planHosts.userId }).from(planHosts).where(and(eq(planHosts.planId, planId), eq(planHosts.userId, userId))).limit(1);
  if (h) return "host";
  const [g] = await db.select({ status: guests.status }).from(guests).where(and(eq(guests.planId, planId), eq(guests.userId, userId))).limit(1);
  return g ? (g.status as RsvpStatus) : null;
}

/** The viewer's own guest row for a plan (their RSVP), if any. */
export async function getViewerGuest(planId: string, userId: string | null) {
  if (!userId) return null;
  const db = await getDb();
  const [g] = await db.select().from(guests).where(and(eq(guests.planId, planId), eq(guests.userId, userId))).limit(1);
  if (!g) return null;
  const votes = await db.select().from(pollVotes).where(eq(pollVotes.guestId, g.id));
  return { ...toGuest(g), followHost: g.followHost, votes: Object.fromEntries(votes.map((v) => [v.optionId, v.vote as "yes" | "maybe" | "no"])) };
}

/** Plans the user hosts or answered, soonest first (undated last). */
export async function listPlansForUser(userId: string): Promise<{ plan: Plan; role: PlanRole }[]> {
  const db = await getDb();
  const hosted = await db.select({ id: planHosts.planId }).from(planHosts).where(eq(planHosts.userId, userId));
  const answered = await db.select({ id: guests.planId, status: guests.status }).from(guests).where(eq(guests.userId, userId));
  const ids = [...new Set([...hosted.map((h) => h.id), ...answered.map((a) => a.id)])];
  if (!ids.length) return [];
  const rows = await db.select().from(plans).where(and(inArray(plans.id, ids), or(eq(plans.status, "published"), eq(plans.status, "draft"))));
  const hostedSet = new Set(hosted.map((h) => h.id));
  const statusById = new Map(answered.map((a) => [a.id, a.status as RsvpStatus]));
  const out = await Promise.all(rows.map(async (r) => ({ plan: await assemble(r), role: (hostedSet.has(r.id) ? "host" : statusById.get(r.id) ?? "invited") as PlanRole })));
  return out.sort((a, b) => (a.plan.startsAt ?? "9").localeCompare(b.plan.startsAt ?? "9"));
}

export async function listNotifications(userId: string): Promise<Notification[]> {
  const db = await getDb();
  const rows = await db
    .select({ n: notifications, code: plans.code, title: plans.title })
    .from(notifications)
    .leftJoin(plans, eq(plans.id, notifications.planId))
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
  return rows.map(({ n, code, title }) => ({
    id: n.id,
    code: code ?? "",
    planTitle: title ?? "",
    initials: initials(n.actorName || "?"),
    gradient: gradientFor(n.actorName),
    kind: n.kind as Notification["kind"],
    text: n.text,
    at: n.createdAt.toISOString(),
    unread: !n.readAt,
    role: n.role as Notification["role"],
  }));
}

export async function getUser(id: string) {
  const db = await getDb();
  const [u] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return u ?? null;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  const [u] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  return u ?? null;
}
