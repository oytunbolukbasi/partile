import { and, asc, count, desc, eq, inArray, isNull, lte, or, sql } from "drizzle-orm";
import { gradientFor, initials, type Conversation, type Guest, type Message, type Notification, type Plan, type PlanRole, type RsvpStatus } from "@partile/core";
import { getDb } from "./client";
import { blasts, conversations, feedItems, follows, guests, laterReminders, planCodeAliases, messages, notifications, photos, planHosts, planMutes, plans, pollOptions, pollVotes, reminderLog, users } from "./schema";

const isoOf = (d: Date | null | undefined) => (d ? d.toISOString() : undefined);

type PlanRow = typeof plans.$inferSelect;

/** Assemble the read model for one plan. Guest e-mails are never included. */
async function assemble(row: PlanRow): Promise<Plan> {
  const db = await getDb();
  const [hostRows, guestRows, feedRows, blastRows, optionRows, photoRows] = await Promise.all([
    db.select({ userId: planHosts.userId, role: planHosts.role, accepted: planHosts.accepted, position: planHosts.position, name: users.name, email: users.email }).from(planHosts).innerJoin(users, eq(users.id, planHosts.userId)).where(eq(planHosts.planId, row.id)).orderBy(asc(planHosts.position)),
    db.select().from(guests).where(eq(guests.planId, row.id)).orderBy(desc(guests.createdAt)),
    db.select().from(feedItems).where(eq(feedItems.planId, row.id)).orderBy(desc(feedItems.createdAt)),
    db.select().from(blasts).where(eq(blasts.planId, row.id)).orderBy(asc(blasts.createdAt)),
    db.select().from(pollOptions).where(eq(pollOptions.planId, row.id)).orderBy(asc(pollOptions.position)),
    db.select({ p: photos, name: users.name }).from(photos).innerJoin(users, eq(users.id, photos.userId)).where(eq(photos.planId, row.id)).orderBy(desc(photos.createdAt)),
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
    rsvpStyle: row.rsvpStyle as Plan["rsvpStyle"],
    effect: row.effect ?? undefined,
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
    hosts: hostRows.map((h) => ({ id: h.userId, name: h.name || h.email.split("@")[0]!, initials: initials(h.name || h.email), gradient: gradientFor(h.userId), accepted: h.accepted, owner: h.role === "owner" })),
    guests: guestRows.map(toGuest),
    feed: feedRows.map((f) => ({ id: f.id, guestId: f.actorId, kind: f.kind as "rsvp" | "comment" | "blast", text: f.text ?? undefined, at: f.createdAt.toISOString() })),
    blasts: blastRows.map((b) => ({ id: b.id, at: b.createdAt.toISOString(), to: b.toLabel, count: b.count, text: b.text })),
    photos: photoRows.map(({ p, name }) => ({ id: p.id, url: p.url, userId: p.userId, name, at: p.createdAt.toISOString() })),
    views: row.views,
    pollVotes: tally,
    publishedAt: isoOf(row.publishedAt),
  };
}

const toGuest = (g: typeof guests.$inferSelect): Guest => ({
  id: g.id,
  userId: g.userId ?? undefined,
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

/** Looks up by the current share code, falling back to an old code of a renamed plan (callers redirect on `plan.code !== code`). */
export async function getPlanByCode(code: string): Promise<Plan | null> {
  const db = await getDb();
  const [row] = await db.select().from(plans).where(eq(plans.code, code)).limit(1);
  if (row) return assemble(row);
  const [alias] = await db.select({ planId: planCodeAliases.planId }).from(planCodeAliases).where(eq(planCodeAliases.code, code)).limit(1);
  return alias ? getPlanById(alias.planId) : null;
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
  const [h] = await db.select({ userId: planHosts.userId }).from(planHosts).where(and(eq(planHosts.planId, planId), eq(planHosts.userId, userId), eq(planHosts.accepted, true))).limit(1);
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
  const hosted = await db.select({ id: planHosts.planId }).from(planHosts).where(and(eq(planHosts.userId, userId), eq(planHosts.accepted, true)));
  const answered = await db.select({ id: guests.planId, status: guests.status }).from(guests).where(eq(guests.userId, userId));
  const ids = [...new Set([...hosted.map((h) => h.id), ...answered.map((a) => a.id)])];
  if (!ids.length) return [];
  const rows = await db.select().from(plans).where(and(inArray(plans.id, ids), or(eq(plans.status, "published"), eq(plans.status, "draft"), eq(plans.status, "cancelled"))));
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

/** E-mail addresses for mailing guests. Server-side only; never passed to the client or to hosts. */
export async function listGuestEmails(planId: string, guestIds: string[]): Promise<string[]> {
  if (!guestIds.length) return [];
  const db = await getDb();
  const rows = await db.select({ email: guests.email, userId: guests.userId }).from(guests).where(and(eq(guests.planId, planId), inArray(guests.id, guestIds)));
  const muted = new Set((await db.select({ userId: planMutes.userId }).from(planMutes).where(eq(planMutes.planId, planId))).map((m) => m.userId));
  return [...new Set(rows.filter((r) => !r.userId || !muted.has(r.userId)).map((r) => r.email).filter((e): e is string => !!e))];
}

/** Published, public, upcoming plans for Keşfet, soonest first. */
export async function listPublicPlans(limit = 40): Promise<Plan[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(plans)
    .where(and(eq(plans.status, "published"), eq(plans.visibility, "public")))
    .orderBy(asc(plans.startsAt))
    .limit(limit);
  const now = Date.now();
  const upcoming = rows.filter((r) => !r.startsAt || r.startsAt.getTime() > now - 6 * 3600 * 1000);
  return Promise.all(upcoming.map(assemble));
}

/* ---------- messages ---------- */

export async function listConversations(userId: string): Promise<Conversation[]> {
  const db = await getDb();
  const rows = await db
    .select({ c: conversations, code: plans.code, title: plans.title })
    .from(conversations)
    .innerJoin(plans, eq(plans.id, conversations.planId))
    .where(or(eq(conversations.hostId, userId), eq(conversations.guestId, userId)))
    .orderBy(desc(conversations.lastAt))
    .limit(100);
  if (!rows.length) return [];
  const otherIds = [...new Set(rows.map(({ c }) => (c.hostId === userId ? c.guestId : c.hostId)))];
  const people = await db.select({ id: users.id, name: users.name }).from(users).where(inArray(users.id, otherIds));
  const nameOf = new Map(people.map((p) => [p.id, p.name]));
  const msgs = await db.select().from(messages).where(inArray(messages.conversationId, rows.map(({ c }) => c.id))).orderBy(desc(messages.createdAt));
  const guestStatus = await db.select({ planId: guests.planId, userId: guests.userId, status: guests.status }).from(guests).where(inArray(guests.planId, [...new Set(rows.map(({ c }) => c.planId))]));
  const label = (status?: string) => (status === "going" ? "Geliyorum" : status === "maybe" ? "Belki" : status === "no" ? "Gelemiyorum" : status === "pending" ? "onay bekliyor" : "misafir");
  return rows.map(({ c, code, title }) => {
    const role = c.hostId === userId ? "host" : "guest";
    const otherId = role === "host" ? c.guestId : c.hostId;
    const mine = msgs.filter((m) => m.conversationId === c.id);
    const last = mine[0];
    const gs = guestStatus.find((g) => g.planId === c.planId && g.userId === c.guestId)?.status;
    return {
      id: c.id,
      planCode: code,
      planTitle: title,
      other: { id: otherId, name: nameOf.get(otherId) ?? "Kullanıcı", initials: initials(nameOf.get(otherId) ?? "?"), gradient: gradientFor(otherId) },
      role,
      otherRoleLabel: role === "host" ? label(gs) : "düzenleyen",
      lastText: last ? (last.senderId === userId ? `Sen: ${last.text}` : last.text) : undefined,
      lastAt: (last?.createdAt ?? c.lastAt).toISOString(),
      unread: mine.filter((m) => m.senderId !== userId && !m.readAt).length,
    };
  });
}

export async function getConversation(id: string, userId: string): Promise<{ meta: Conversation; messages: Message[] } | null> {
  const all = await listConversations(userId);
  const meta = all.find((c) => c.id === id);
  if (!meta) return null;
  const db = await getDb();
  const rows = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(asc(messages.createdAt));
  return { meta, messages: rows.map((m) => ({ id: m.id, senderId: m.senderId, text: m.text, at: m.createdAt.toISOString(), read: !!m.readAt })) };
}

/* ---------- reminders (cron) ---------- */

export type DueReminder = { plan: Plan; kind: "rsvp" | "event"; recipients: { guestId: string; userId: string | null; email: string | null; name: string }[] };

/**
 * Plans whose reminder window opened and that were not reminded yet:
 * rsvp → 7 days before (plans published at least that early), to invited + maybe;
 * event → 2 hours before, to going.
 */
export async function dueReminders(now = new Date()): Promise<DueReminder[]> {
  const db = await getDb();
  const WEEK = 7 * 864e5;
  const TWO_H = 2 * 3600e3;
  const rows = await db.select().from(plans).where(and(eq(plans.status, "published"), eq(plans.remindersEnabled, true)));
  const sent = await db.select().from(reminderLog);
  const wasSent = (planId: string, kind: string) => sent.some((r) => r.planId === planId && r.kind === kind);
  const out: DueReminder[] = [];
  for (const r of rows) {
    if (!r.startsAt || r.startsAt.getTime() <= now.getTime()) continue;
    const until = r.startsAt.getTime() - now.getTime();
    const published = (r.publishedAt ?? r.createdAt).getTime();
    const kinds: ("rsvp" | "event")[] = [];
    if (until <= WEEK && published <= r.startsAt.getTime() - WEEK && !wasSent(r.id, "rsvp")) kinds.push("rsvp");
    if (until <= TWO_H && !wasSent(r.id, "event")) kinds.push("event");
    if (!kinds.length) continue;
    const gs = await db.select({ id: guests.id, userId: guests.userId, email: guests.email, name: guests.name, status: guests.status }).from(guests).where(eq(guests.planId, r.id));
    const plan = await assemble(r);
    const muted = new Set((await db.select({ userId: planMutes.userId }).from(planMutes).where(eq(planMutes.planId, r.id))).map((m) => m.userId));
    for (const kind of kinds) {
      const want = kind === "rsvp" ? ["invited", "maybe"] : ["going"];
      out.push({ plan, kind, recipients: gs.filter((g) => want.includes(g.status) && !(g.userId && muted.has(g.userId))).map((g) => ({ guestId: g.id, userId: g.userId, email: g.email, name: g.name })) });
    }
  }
  return out;
}

/** Health check: the connection answers. */
export async function ping(): Promise<boolean> {
  const db = await getDb();
  await db.execute(sql`select 1`);
  return true;
}

/** Viewer-specific switches on the plan page: muted, following the hosts, pending "Sonra hatırlat". */
export async function viewerPlanState(planId: string, userId: string | null, hostIds: string[]) {
  const db = await getDb();
  const [followers] = hostIds[0] ? await db.select({ n: count() }).from(follows).where(eq(follows.followeeId, hostIds[0])) : [{ n: 0 }];
  if (!userId) return { muted: false, following: false, remindAt: null as string | null, followers: followers?.n ?? 0 };
  const [m] = await db.select({ u: planMutes.userId }).from(planMutes).where(and(eq(planMutes.planId, planId), eq(planMutes.userId, userId))).limit(1);
  const f = hostIds.length ? await db.select({ id: follows.followeeId }).from(follows).where(and(eq(follows.followerId, userId), inArray(follows.followeeId, hostIds))) : [];
  const [l] = await db.select().from(laterReminders).where(and(eq(laterReminders.planId, planId), eq(laterReminders.userId, userId), isNull(laterReminders.sentAt))).limit(1);
  return { muted: !!m, following: f.length > 0, remindAt: l ? l.remindAt.toISOString() : null, followers: followers?.n ?? 0 };
}

export async function listMutedPlanIds(userId: string): Promise<string[]> {
  const db = await getDb();
  return (await db.select({ id: planMutes.planId }).from(planMutes).where(eq(planMutes.userId, userId))).map((r) => r.id);
}

export type DueLaterReminder = { plan: Plan; userId: string; email: string };

/** "Sonra hatırlat" rows whose time came, for users who still have not answered a live plan. */
export async function dueLaterReminders(now = new Date()): Promise<DueLaterReminder[]> {
  const db = await getDb();
  const rows = await db
    .select({ planId: laterReminders.planId, userId: laterReminders.userId, email: users.email })
    .from(laterReminders)
    .innerJoin(users, eq(users.id, laterReminders.userId))
    .where(and(isNull(laterReminders.sentAt), lte(laterReminders.remindAt, now)));
  const out: DueLaterReminder[] = [];
  for (const r of rows) {
    const [p] = await db.select().from(plans).where(eq(plans.id, r.planId)).limit(1);
    const [g] = p ? await db.select({ status: guests.status }).from(guests).where(and(eq(guests.planId, r.planId), eq(guests.userId, r.userId))).limit(1) : [];
    const stale = !p || p.status !== "published" || (p.startsAt && p.startsAt.getTime() <= now.getTime()) || (g && g.status !== "invited");
    if (stale) {
      await db.delete(laterReminders).where(and(eq(laterReminders.planId, r.planId), eq(laterReminders.userId, r.userId)));
      continue;
    }
    out.push({ plan: await assemble(p!), userId: r.userId, email: r.email });
  }
  return out;
}

export type Person = { id: string; name: string; initials: string; gradient: string; shared: number };

/**
 * People the user shared a plan with: on plans the user hosts or answered Geliyorum/Belki, everyone else with an
 * account who answered Geliyorum/Belki or hosts it. `shared` = number of such plans. Names only; no e-mails.
 */
export async function listCoAttendees(userId: string): Promise<Person[]> {
  const db = await getDb();
  const live = ["going", "maybe"];
  const hosted = await db.select({ planId: planHosts.planId }).from(planHosts).where(and(eq(planHosts.userId, userId), eq(planHosts.accepted, true)));
  const joined = await db.select({ planId: guests.planId }).from(guests).where(and(eq(guests.userId, userId), inArray(guests.status, live)));
  const planIds = [...new Set([...hosted, ...joined].map((r) => r.planId))];
  if (!planIds.length) return [];
  const gs = await db.select({ userId: guests.userId, planId: guests.planId }).from(guests).where(and(inArray(guests.planId, planIds), inArray(guests.status, live)));
  const hs = await db.select({ userId: planHosts.userId, planId: planHosts.planId }).from(planHosts).where(and(inArray(planHosts.planId, planIds), eq(planHosts.accepted, true)));
  const shared = new Map<string, Set<string>>();
  for (const r of [...gs, ...hs]) {
    if (!r.userId || r.userId === userId) continue;
    const set = shared.get(r.userId) ?? new Set<string>();
    set.add(r.planId);
    shared.set(r.userId, set);
  }
  if (!shared.size) return [];
  const people = await db.select({ id: users.id, name: users.name }).from(users).where(inArray(users.id, [...shared.keys()]));
  return people
    .filter((p) => p.name.trim())
    .map((p) => ({ id: p.id, name: p.name, initials: initials(p.name), gradient: gradientFor(p.id), shared: shared.get(p.id)!.size }))
    .sort((a, b) => b.shared - a.shared || a.name.localeCompare(b.name, "tr"));
}

/** Hosts the user follows, newest first, with their upcoming public plan count. */
export async function listFollowing(userId: string): Promise<(Person & { upcoming: number })[]> {
  const db = await getDb();
  const rows = await db
    .select({ id: users.id, name: users.name, at: follows.createdAt })
    .from(follows)
    .innerJoin(users, eq(users.id, follows.followeeId))
    .where(eq(follows.followerId, userId))
    .orderBy(desc(follows.createdAt));
  const now = new Date();
  return Promise.all(
    rows.map(async (r) => {
      const [c] = await db
        .select({ n: count() })
        .from(plans)
        .where(and(eq(plans.ownerId, r.id), eq(plans.status, "published"), eq(plans.visibility, "public"), sql`${plans.startsAt} > ${now}`));
      return { id: r.id, name: r.name || "Adsız", initials: initials(r.name || "?"), gradient: gradientFor(r.id), shared: 0, upcoming: c?.n ?? 0 };
    }),
  );
}

export async function countFollowers(userId: string): Promise<number> {
  const db = await getDb();
  const [c] = await db.select({ n: count() }).from(follows).where(eq(follows.followeeId, userId));
  return c?.n ?? 0;
}

/** "Galerim": posters of plans the user hosts and photos they uploaded, newest first, stored files only (no data: URLs). */
export async function listGallery(userId: string, limit = 36): Promise<{ posters: string[]; photos: string[] }> {
  const db = await getDb();
  const hosted = await db
    .select({ url: plans.posterUrl, at: plans.updatedAt })
    .from(plans)
    .innerJoin(planHosts, and(eq(planHosts.planId, plans.id), eq(planHosts.userId, userId), eq(planHosts.accepted, true)))
    .orderBy(desc(plans.updatedAt));
  const own = await db.select({ url: photos.url }).from(photos).where(eq(photos.userId, userId)).orderBy(desc(photos.createdAt)).limit(limit);
  const stored = (u: string | null): u is string => !!u && !u.startsWith("data:");
  const posters = [...new Set(hosted.map((h) => h.url).filter(stored))].slice(0, limit);
  const seen = new Set(posters);
  return { posters, photos: [...new Set(own.map((p) => p.url).filter(stored))].filter((u) => !seen.has(u)) };
}
