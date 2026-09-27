"use server";

import { revalidatePath } from "next/cache";
import { PlanDraft, Rsvp, VerificationCode } from "@partile/core";
import {
  addComment,
  consumeVerificationCode,
  createPlan,
  createVerificationCode,
  deleteFeedItem,
  getPlanByCode,
  isHost,
  listGuestEmails,
  markNotificationsRead,
  removePhoto,
  inviteCohost as inviteCohostRow,
  respondCohost as respondCohostRow,
  removeCohost as removeCohostRow,
  ensureConversation,
  sendMessage,
  markConversationRead,
  pickPollDay,
  removeGuest,
  sendBlast,
  setCheckedIn,
  setGuestStatus,
  setPaid,
  updatePlan,
  updateUser,
  upsertRsvp,
  votePoll,
} from "@partile/db";
import { clearSession, getViewer, setSession } from "@/lib/auth";
import { mailEnabled, sendBlastMail, sendCohostMail, sendVerificationMail } from "@/lib/mail";
import { materialize, remove as removeFile } from "@/lib/storage";
import { routes } from "@/lib/routes";

const EMAIL = /^\S+@\S+\.\S+$/;

/* ---------- auth ---------- */

/** Creates a one-time code and e-mails it (Resend). Without an API key the code comes back for the UI to show. */
export async function requestCode(email: string, purpose: "login" | "rsvp" = "login", next?: string) {
  const e = email.trim().toLowerCase();
  if (!EMAIL.test(e)) return { ok: false as const, error: "Geçerli bir e-posta gir." };
  const code = await createVerificationCode(e, purpose);
  if (!mailEnabled()) return { ok: true as const, devCode: code };
  const r = await sendVerificationMail(e, code, purpose, next);
  if (!r.sent) return { ok: false as const, error: "E-posta gönderilemedi. Biraz sonra tekrar dene." };
  // Outside production the code stays visible so sample accounts (demo@…) can sign in without a mailbox.
  return { ok: true as const, devCode: process.env.NODE_ENV === "production" ? undefined : code };
}

export async function verifyCode(email: string, code: string) {
  if (!VerificationCode.safeParse(code).success) return { ok: false as const, error: "6 haneli kodu gir." };
  const user = await consumeVerificationCode(email, code);
  if (!user) return { ok: false as const, error: "Kod geçersiz ya da süresi dolmuş." };
  await setSession(user.id);
  return { ok: true as const, onboarded: user.onboarded, name: user.name };
}

export async function signOut() {
  await clearSession();
  revalidatePath("/", "layout");
}

export async function completeOnboarding(input: { name: string; birthday?: string; notifications: boolean }) {
  const v = await getViewer();
  if (!v) return { ok: false as const };
  await updateUser(v.id, { name: input.name.trim(), birthday: input.birthday || null, notifications: input.notifications, onboarded: true });
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function updateProfile(patch: { name?: string; bio?: string; birthday?: string; notifications?: boolean }) {
  const v = await getViewer();
  if (!v) return { ok: false as const };
  await updateUser(v.id, { ...(patch.name !== undefined && { name: patch.name.trim() }), ...(patch.bio !== undefined && { bio: patch.bio }), ...(patch.birthday !== undefined && { birthday: patch.birthday || null }), ...(patch.notifications !== undefined && { notifications: patch.notifications }) });
  revalidatePath(routes.profile);
  revalidatePath("/", "layout");
  return { ok: true as const };
}

/* ---------- plans (host) ---------- */

export async function publishDraft(input: unknown) {
  const v = await getViewer();
  if (!v) return { ok: false as const, error: "Önce giriş yap." };
  const parsed = PlanDraft.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Plan eksik." };
  const posterUrl = await materialize(parsed.data.posterUrl);
  const { code } = await createPlan(v.id, { ...parsed.data, posterUrl }, true);
  revalidatePath(routes.home);
  return { ok: true as const, code };
}

async function hostOf(code: string) {
  const v = await getViewer();
  const plan = await getPlanByCode(code);
  if (!v || !plan || !(await isHost(plan.id, v.id))) return null;
  return { v, plan };
}

export async function savePlan(code: string, patch: Partial<PlanDraft>) {
  const h = await hostOf(code);
  if (!h) return { ok: false as const };
  await updatePlan(h.plan.id, "posterUrl" in patch ? { ...patch, posterUrl: await materialize(patch.posterUrl) } : patch);
  revalidatePath(routes.plan(code));
  revalidatePath(routes.home);
  return { ok: true as const };
}

export async function pickDay(code: string, optionId: string) {
  const h = await hostOf(code);
  if (!h) return { ok: false as const };
  await pickPollDay(h.plan.id, optionId);
  revalidatePath(routes.plan(code));
  return { ok: true as const };
}

export async function decideGuest(code: string, guestId: string, decision: "approve" | "reject") {
  const h = await hostOf(code);
  if (!h) return { ok: false as const };
  if (decision === "approve") await setGuestStatus(guestId, "going");
  else await removeGuest(guestId);
  revalidatePath(routes.plan(code));
  return { ok: true as const };
}

export async function setGuestFlag(code: string, guestId: string, flag: "checkedIn" | "paid", value: boolean) {
  const h = await hostOf(code);
  if (!h) return { ok: false as const };
  if (flag === "checkedIn") await setCheckedIn(guestId, value);
  else await setPaid(guestId, value);
  revalidatePath(routes.plan(code));
  return { ok: true as const };
}

export async function blast(code: string, toLabel: string, guestIds: string[], text: string) {
  const h = await hostOf(code);
  if (!h) return { ok: false as const };
  if (h.plan.blasts.length >= 10 || !text.trim()) return { ok: false as const };
  const body = text.trim().slice(0, 400);
  await sendBlast(h.plan.id, h.v.id, toLabel, guestIds, body);
  const emails = await listGuestEmails(h.plan.id, guestIds);
  await sendBlastMail(emails, { title: h.plan.title, code: h.plan.code, startsAt: h.plan.startsAt, district: h.plan.location?.district }, h.v.name || "Düzenleyen", body);
  revalidatePath(routes.plan(code));
  return { ok: true as const };
}

export async function removeFeedItem(code: string, itemId: string) {
  const h = await hostOf(code);
  if (!h) return { ok: false as const };
  await deleteFeedItem(h.plan.id, itemId);
  revalidatePath(routes.plan(code));
  return { ok: true as const };
}

/* ---------- guest ---------- */

/** Final RSVP step. The guest verified their e-mail in step 2, so a session exists. */
export async function submitRsvp(code: string, input: unknown) {
  const v = await getViewer();
  if (!v) return { ok: false as const, error: "Önce e-postanı doğrula." };
  const parsed = Rsvp.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: `Eksik bilgi: ${parsed.error.issues[0]?.message ?? "formu kontrol et"}` };
  const plan = await getPlanByCode(code);
  if (!plan) return { ok: false as const, error: "Plan bulunamadı." };
  try {
    if (!v.name) await updateUser(v.id, { name: parsed.data.name });
    const r = await upsertRsvp(plan.id, v.id, v.email, parsed.data);
    revalidatePath(routes.plan(code));
    revalidatePath(routes.home);
    return { ok: true as const, status: r?.status };
  } catch (e) {
    console.error("[rsvp] submit failed", e);
    return { ok: false as const, error: "Kaydedilemedi, tekrar dene." };
  }
}

export async function submitVotes(code: string, name: string, votes: Record<string, "yes" | "maybe" | "no">) {
  const v = await getViewer();
  if (!v) return { ok: false as const, error: "Önce e-postanı doğrula." };
  const plan = await getPlanByCode(code);
  if (!plan) return { ok: false as const, error: "Plan bulunamadı." };
  if (!v.name && name.trim()) await updateUser(v.id, { name: name.trim() });
  await votePoll(plan.id, v.id, v.email, name.trim() || v.name || "Misafir", votes);
  revalidatePath(routes.plan(code));
  return { ok: true as const };
}

export async function comment(code: string, text: string) {
  const v = await getViewer();
  const plan = await getPlanByCode(code);
  if (!v || !plan || !text.trim()) return { ok: false as const };
  const { getViewerGuest } = await import("@partile/db");
  const g = await getViewerGuest(plan.id, v.id);
  const actorId = g ? g.id : (await isHost(plan.id, v.id)) ? v.id : null;
  if (!actorId) return { ok: false as const };
  await addComment(plan.id, actorId, text.trim().slice(0, 500));
  revalidatePath(routes.plan(code));
  return { ok: true as const };
}

/* ---------- notifications ---------- */

export async function markRead(ids?: string[]) {
  const v = await getViewer();
  if (!v) return { ok: false as const };
  await markNotificationsRead(v.id, ids);
  revalidatePath(routes.notifications);
  return { ok: true as const };
}

/* ---------- messages ---------- */

/** Open (or find) the thread between the viewer and `otherUserId` on a plan; either side may start it. */
export async function openConversation(code: string, otherUserId: string) {
  const v = await getViewer();
  const plan = await getPlanByCode(code);
  if (!v || !plan) return { ok: false as const };
  const viewerIsHost = await isHost(plan.id, v.id);
  const cid = viewerIsHost ? await ensureConversation(plan.id, v.id, otherUserId) : await ensureConversation(plan.id, otherUserId, v.id);
  if (!cid) return { ok: false as const };
  return { ok: true as const, id: cid };
}

export async function postMessage(conversationId: string, text: string) {
  const v = await getViewer();
  if (!v || !text.trim()) return { ok: false as const };
  const id = await sendMessage(conversationId, v.id, text.trim().slice(0, 1000));
  if (!id) return { ok: false as const };
  revalidatePath(routes.messages);
  return { ok: true as const };
}

export async function readConversation(conversationId: string) {
  const v = await getViewer();
  if (!v) return { ok: false as const };
  await markConversationRead(conversationId, v.id);
  return { ok: true as const };
}

/* ---------- album ---------- */

export async function deletePhoto(code: string, photoId: string) {
  const v = await getViewer();
  const plan = await getPlanByCode(code);
  if (!v || !plan) return { ok: false as const };
  const url = await removePhoto(plan.id, photoId, v.id);
  if (!url) return { ok: false as const };
  await removeFile(url);
  revalidatePath(routes.plan(code));
  return { ok: true as const };
}

/* ---------- co-hosts ---------- */

export async function inviteCohost(code: string, email: string) {
  const h = await hostOf(code);
  if (!h) return { ok: false as const, error: "Yetki yok." };
  const e = email.trim().toLowerCase();
  if (!EMAIL.test(e)) return { ok: false as const, error: "Geçerli bir e-posta gir." };
  const r = await inviteCohostRow(h.plan.id, h.v.id, e);
  if ("error" in r) return { ok: false as const, error: r.error };
  const loginCode = await createVerificationCode(e, "login");
  const mail = await sendCohostMail(e, loginCode, { title: h.plan.title, code: h.plan.code }, h.v.name || "Bir düzenleyen");
  revalidatePath(routes.plan(code));
  return { ok: true as const, mailed: mail.sent, devLink: mail.sent ? undefined : `/giris/dogrula?e=${encodeURIComponent(e)}&kod=${loginCode}&next=${encodeURIComponent(`/e/${code}`)}` };
}

export async function respondCohost(code: string, accept: boolean) {
  const v = await getViewer();
  const plan = await getPlanByCode(code);
  if (!v || !plan) return { ok: false as const };
  await respondCohostRow(plan.id, v.id, accept);
  revalidatePath(routes.plan(code));
  revalidatePath(routes.home);
  return { ok: true as const };
}

export async function removeCohost(code: string, userId: string) {
  const h = await hostOf(code);
  if (!h) return { ok: false as const };
  const done = await removeCohostRow(h.plan.id, h.v.id, userId);
  revalidatePath(routes.plan(code));
  return { ok: done };
}
