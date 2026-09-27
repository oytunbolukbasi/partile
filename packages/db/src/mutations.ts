import { randomBytes, randomUUID } from "node:crypto";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import type { PlanDraft, Rsvp } from "@partile/core";
import { getDb } from "./client";
import { blasts, conversations, feedItems, guests, messages, notifications, planHosts, plans, pollOptions, pollVotes, users, verificationCodes } from "./schema";

const id = () => randomUUID();
const CODE_TTL_MS = 10 * 60 * 1000;

/* ---------- users & verification ---------- */

export async function ensureUser(email: string, name = "") {
  const db = await getDb();
  const e = email.trim().toLowerCase();
  const [existing] = await db.select().from(users).where(eq(users.email, e)).limit(1);
  if (existing) return existing;
  const [created] = await db.insert(users).values({ id: id(), email: e, name }).returning();
  return created!;
}

export async function updateUser(userId: string, patch: Partial<Pick<typeof users.$inferInsert, "name" | "bio" | "birthday" | "notifications" | "onboarded">>) {
  const db = await getDb();
  const [u] = await db.update(users).set(patch).where(eq(users.id, userId)).returning();
  return u ?? null;
}

/** Create a 6-digit code for an e-mail. Returns the code so the caller can send it (Resend) or show it in development. */
export async function createVerificationCode(email: string, purpose: "login" | "rsvp"): Promise<string> {
  const db = await getDb();
  const code = String(randomBytes(4).readUInt32BE(0) % 1_000_000).padStart(6, "0");
  await db.insert(verificationCodes).values({ id: id(), email: email.trim().toLowerCase(), code, purpose, expiresAt: new Date(Date.now() + CODE_TTL_MS) });
  return code;
}

/** Consume a code; on success returns (creating if needed) the user. */
export async function consumeVerificationCode(email: string, code: string) {
  const db = await getDb();
  const e = email.trim().toLowerCase();
  const [row] = await db
    .select()
    .from(verificationCodes)
    .where(and(eq(verificationCodes.email, e), eq(verificationCodes.code, code), isNull(verificationCodes.usedAt), gt(verificationCodes.expiresAt, new Date())))
    .limit(1);
  if (!row) return null;
  await db.update(verificationCodes).set({ usedAt: new Date() }).where(eq(verificationCodes.id, row.id));
  return ensureUser(e);
}

/* ---------- plans ---------- */

const CODE_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
async function freeCode(base: string): Promise<string> {
  const db = await getDb();
  const slug = base
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 20);
  for (let i = 0; i < 10; i++) {
    const suffix = Array.from({ length: 4 }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join("");
    const code = slug.length >= 4 && i === 0 ? slug : `${slug || "plan"}-${suffix}`;
    const [hit] = await db.select({ id: plans.id }).from(plans).where(eq(plans.code, code)).limit(1);
    if (!hit) return code;
  }
  return `plan-${randomUUID().slice(0, 8)}`;
}

function draftToRow(d: PlanDraft) {
  return {
    title: d.title,
    titleFont: d.titleFont,
    themeId: d.themeId,
    posterUrl: d.posterUrl ?? null,
    posterText: d.posterText ?? null,
    description: d.description ?? null,
    startsAt: d.startsAt ? new Date(d.startsAt) : null,
    endsAt: d.endsAt ? new Date(d.endsAt) : null,
    dateTbd: d.dateTbd,
    location: d.location ?? null,
    visibility: d.visibility,
    capacity: d.capacity ?? null,
    plusOnesMax: d.plusOnesMax,
    requirePlusOneNames: d.requirePlusOneNames,
    requireApproval: d.requireApproval,
    allowMaybe: d.allowMaybe,
    guestsCanInviteMutuals: d.guestsCanInviteMutuals,
    remindersEnabled: d.remindersEnabled,
    showGuestNames: d.showGuestNames,
    showGuestCount: d.showGuestCount,
    showTimestamps: d.showTimestamps,
    albumGuestsCanUpload: d.albumGuestsCanUpload,
    albumFilter: d.albumFilter,
    questions: d.questions,
    cost: d.cost,
    extras: (d.extras as Record<string, unknown> | undefined) ?? null,
    updatedAt: new Date(),
  };
}

async function syncPoll(planId: string, poll: PlanDraft["poll"]) {
  const db = await getDb();
  const existing = await db.select({ id: pollOptions.id }).from(pollOptions).where(eq(pollOptions.planId, planId));
  const keep = new Set((poll ?? []).map((o) => o.id));
  for (const e of existing) if (!keep.has(e.id)) await db.delete(pollOptions).where(eq(pollOptions.id, e.id));
  for (const [i, o] of (poll ?? []).entries()) {
    const values = { planId, startsAt: new Date(o.startsAt), endsAt: o.endsAt ? new Date(o.endsAt) : null, position: i };
    if (existing.some((e) => e.id === o.id)) await db.update(pollOptions).set(values).where(eq(pollOptions.id, o.id));
    else await db.insert(pollOptions).values({ id: o.id, ...values });
  }
}

/** Create a plan for a host (published straight away — drafts live in the browser until then). */
export async function createPlan(ownerId: string, draft: PlanDraft, publish = true): Promise<{ id: string; code: string }> {
  const db = await getDb();
  const planId = id();
  const code = await freeCode(draft.title);
  await db.insert(plans).values({ id: planId, code, ownerId, status: publish ? "published" : "draft", publishedAt: publish ? new Date() : null, ...draftToRow(draft) });
  await db.insert(planHosts).values({ planId, userId: ownerId, role: "owner", position: 0 });
  await syncPoll(planId, draft.poll);
  return { id: planId, code };
}

export async function updatePlan(planId: string, patch: Partial<PlanDraft>) {
  const db = await getDb();
  const [current] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
  if (!current) return null;
  const merged = { ...rowToDraft(current), ...patch };
  await db.update(plans).set(draftToRow(merged)).where(eq(plans.id, planId));
  if ("poll" in patch) await syncPoll(planId, patch.poll);
  return merged;
}

function rowToDraft(r: typeof plans.$inferSelect): PlanDraft {
  return {
    title: r.title,
    titleFont: r.titleFont,
    themeId: r.themeId,
    posterUrl: r.posterUrl ?? undefined,
    posterText: r.posterText ?? undefined,
    description: r.description ?? undefined,
    startsAt: r.startsAt?.toISOString(),
    endsAt: r.endsAt?.toISOString(),
    dateTbd: r.dateTbd,
    location: r.location ?? undefined,
    visibility: r.visibility as PlanDraft["visibility"],
    capacity: r.capacity ?? undefined,
    plusOnesMax: r.plusOnesMax,
    requirePlusOneNames: r.requirePlusOneNames,
    requireApproval: r.requireApproval,
    allowMaybe: r.allowMaybe,
    guestsCanInviteMutuals: r.guestsCanInviteMutuals,
    remindersEnabled: r.remindersEnabled,
    showGuestNames: r.showGuestNames,
    showGuestCount: r.showGuestCount,
    showTimestamps: r.showTimestamps,
    albumGuestsCanUpload: r.albumGuestsCanUpload,
    albumFilter: r.albumFilter as PlanDraft["albumFilter"],
    questions: r.questions,
    cost: r.cost,
    extras: (r.extras as PlanDraft["extras"]) ?? undefined,
  };
}

export async function isHost(planId: string, userId: string): Promise<boolean> {
  const db = await getDb();
  const [h] = await db.select({ userId: planHosts.userId }).from(planHosts).where(and(eq(planHosts.planId, planId), eq(planHosts.userId, userId))).limit(1);
  return !!h;
}

export async function bumpViews(planId: string) {
  const db = await getDb();
  await db.update(plans).set({ views: sql`${plans.views} + 1` }).where(eq(plans.id, planId));
}

/** Host picks a poll day: date set, poll closed, votes become RSVPs (yes → going, maybe → maybe, no → no). */
export async function pickPollDay(planId: string, optionId: string) {
  const db = await getDb();
  const [opt] = await db.select().from(pollOptions).where(and(eq(pollOptions.id, optionId), eq(pollOptions.planId, planId))).limit(1);
  if (!opt) return null;
  const votes = await db.select().from(pollVotes).where(eq(pollVotes.optionId, optionId));
  const map: Record<string, string> = { yes: "going", maybe: "maybe", no: "no" };
  for (const v of votes) await db.update(guests).set({ status: map[v.vote] ?? "invited", updatedAt: new Date() }).where(eq(guests.id, v.guestId));
  await db.update(plans).set({ startsAt: opt.startsAt, endsAt: opt.endsAt, dateTbd: false, updatedAt: new Date() }).where(eq(plans.id, planId));
  await db.delete(pollOptions).where(eq(pollOptions.planId, planId));
  return opt;
}

/* ---------- guests ---------- */

/** Create or update the user's RSVP on a plan. Pending when the host requires approval and the guest is new. */
export async function upsertRsvp(planId: string, userId: string, email: string, r: Rsvp) {
  const db = await getDb();
  const [plan] = await db.select({ requireApproval: plans.requireApproval, ownerId: plans.ownerId, title: plans.title }).from(plans).where(eq(plans.id, planId)).limit(1);
  if (!plan) return null;
  const [existing] = await db.select().from(guests).where(and(eq(guests.planId, planId), eq(guests.userId, userId))).limit(1);
  const status = plan.requireApproval && r.status !== "no" && (!existing || existing.status === "invited" || existing.status === "pending") ? "pending" : r.status;
  const values = { name: r.name, email, status, plusOnes: r.plusOnes, plusOneNames: r.plusOneNames ?? null, note: r.note ?? null, answers: r.answers ?? null, followHost: r.followHost, updatedAt: new Date() };
  let guestId = existing?.id;
  if (existing) await db.update(guests).set(values).where(eq(guests.id, existing.id));
  else {
    guestId = id();
    await db.insert(guests).values({ id: guestId, planId, userId, ...values });
  }
  await db.insert(feedItems).values({ id: id(), planId, actorId: guestId!, kind: "rsvp", text: r.note ?? null });
  const first = r.name.split(" ")[0];
  const label = status === "pending" ? "listeye alınmak istiyor" : status === "going" ? "“Geliyorum” dedi" : status === "maybe" ? "“Belki” dedi" : "gelemiyor";
  await db.insert(notifications).values({ id: id(), userId: plan.ownerId, planId, kind: status === "pending" ? "approval" : "rsvp", actorName: r.name, text: `${first} ${plan.title} için ${label}.`, role: "host" });
  return { guestId: guestId!, status };
}

export async function votePoll(planId: string, userId: string, email: string, name: string, votes: Record<string, "yes" | "maybe" | "no">) {
  const db = await getDb();
  let [g] = await db.select().from(guests).where(and(eq(guests.planId, planId), eq(guests.userId, userId))).limit(1);
  if (!g) {
    const gid = id();
    await db.insert(guests).values({ id: gid, planId, userId, email, name, status: "invited" });
    [g] = await db.select().from(guests).where(eq(guests.id, gid)).limit(1);
  }
  const options = await db.select({ id: pollOptions.id }).from(pollOptions).where(eq(pollOptions.planId, planId));
  for (const o of options) {
    const vote = votes[o.id];
    await db.delete(pollVotes).where(and(eq(pollVotes.optionId, o.id), eq(pollVotes.guestId, g!.id)));
    if (vote) await db.insert(pollVotes).values({ optionId: o.id, guestId: g!.id, vote });
  }
  return g!.id;
}

export async function setGuestStatus(guestId: string, status: string) {
  const db = await getDb();
  await db.update(guests).set({ status, updatedAt: new Date() }).where(eq(guests.id, guestId));
}
export async function removeGuest(guestId: string) {
  const db = await getDb();
  await db.delete(guests).where(eq(guests.id, guestId));
}
export async function setCheckedIn(guestId: string, checkedIn: boolean) {
  const db = await getDb();
  await db.update(guests).set({ checkedIn }).where(eq(guests.id, guestId));
}
export async function setPaid(guestId: string, paid: boolean) {
  const db = await getDb();
  await db.update(guests).set({ paid }).where(eq(guests.id, guestId));
}

/* ---------- blasts, feed, notifications ---------- */

export async function sendBlast(planId: string, userId: string, toLabel: string, recipientGuestIds: string[], text: string) {
  const db = await getDb();
  const bid = id();
  await db.insert(blasts).values({ id: bid, planId, userId, toLabel, count: recipientGuestIds.length, text });
  await db.insert(feedItems).values({ id: bid, planId, actorId: userId, kind: "blast", text });
  const [plan] = await db.select({ title: plans.title }).from(plans).where(eq(plans.id, planId)).limit(1);
  const [host] = await db.select({ name: users.name }).from(users).where(eq(users.id, userId)).limit(1);
  const recipients = recipientGuestIds.length ? await db.select({ userId: guests.userId }).from(guests).where(and(eq(guests.planId, planId), sql`${guests.id} in ${recipientGuestIds}`)) : [];
  const rows = recipients.filter((r) => r.userId).map((r) => ({ id: id(), userId: r.userId!, planId, kind: "blast", actorName: host?.name ?? "", text: `${plan?.title ?? "Plan"}: ${text}`, role: "guest" }));
  if (rows.length) await db.insert(notifications).values(rows);
  return bid;
}

export async function deleteFeedItem(planId: string, itemId: string) {
  const db = await getDb();
  await db.delete(feedItems).where(and(eq(feedItems.id, itemId), eq(feedItems.planId, planId)));
}

export async function addComment(planId: string, guestId: string, text: string) {
  const db = await getDb();
  const cid = id();
  await db.insert(feedItems).values({ id: cid, planId, actorId: guestId, kind: "comment", text });
  return cid;
}

export async function markNotificationsRead(userId: string, ids?: string[]) {
  const db = await getDb();
  const where = ids?.length ? and(eq(notifications.userId, userId), sql`${notifications.id} in ${ids}`) : eq(notifications.userId, userId);
  await db.update(notifications).set({ readAt: new Date() }).where(where);
}

/* ---------- messages ---------- */

/** Find or create the thread between a host and a guest on a plan. Both must belong to the plan. */
export async function ensureConversation(planId: string, hostId: string, guestUserId: string): Promise<string | null> {
  const db = await getDb();
  if (hostId === guestUserId) return null;
  const [h] = await db.select({ userId: planHosts.userId }).from(planHosts).where(and(eq(planHosts.planId, planId), eq(planHosts.userId, hostId))).limit(1);
  const [g] = await db.select({ id: guests.id }).from(guests).where(and(eq(guests.planId, planId), eq(guests.userId, guestUserId))).limit(1);
  if (!h || !g) return null;
  const [existing] = await db.select({ id: conversations.id }).from(conversations).where(and(eq(conversations.planId, planId), eq(conversations.hostId, hostId), eq(conversations.guestId, guestUserId))).limit(1);
  if (existing) return existing.id;
  const cid = id();
  await db.insert(conversations).values({ id: cid, planId, hostId, guestId: guestUserId });
  return cid;
}

export async function sendMessage(conversationId: string, senderId: string, text: string) {
  const db = await getDb();
  const [c] = await db.select().from(conversations).where(eq(conversations.id, conversationId)).limit(1);
  if (!c || (c.hostId !== senderId && c.guestId !== senderId)) return null;
  const mid = id();
  await db.insert(messages).values({ id: mid, conversationId, senderId, text });
  await db.update(conversations).set({ lastAt: new Date() }).where(eq(conversations.id, conversationId));
  const [plan] = await db.select({ title: plans.title, code: plans.code }).from(plans).where(eq(plans.id, c.planId)).limit(1);
  const [sender] = await db.select({ name: users.name }).from(users).where(eq(users.id, senderId)).limit(1);
  const recipient = c.hostId === senderId ? c.guestId : c.hostId;
  await db.insert(notifications).values({ id: id(), userId: recipient, planId: c.planId, kind: "message", actorName: sender?.name ?? "", text: `${(sender?.name ?? "Biri").split(" ")[0]} · ${plan?.title ?? "Plan"}: “${text.slice(0, 80)}”`, role: c.hostId === recipient ? "host" : "guest" });
  return mid;
}

export async function markConversationRead(conversationId: string, userId: string) {
  const db = await getDb();
  await db.update(messages).set({ readAt: new Date() }).where(and(eq(messages.conversationId, conversationId), sql`${messages.senderId} <> ${userId}`, isNull(messages.readAt)));
}
