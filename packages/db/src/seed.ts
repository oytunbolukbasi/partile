import { count } from "drizzle-orm";
import type { Db } from "./client";
import { blasts, feedItems, guests, notifications, planHosts, plans, pollOptions, pollVotes, users } from "./schema";

/** Demo host: sign in with this e-mail to see the sample plans as their organiser. */
export const DEMO_EMAIL = "demo@getpartile.com";

const iso = (s: string) => new Date(s);

/** Sample content mirroring the design canvas: `ece30` (fixed date), `sahil` (attending), `mangal` (date poll). */
export async function seedIfEmpty(db: Db): Promise<void> {
  const [row] = await db.select({ n: count() }).from(users);
  if ((row?.n ?? 0) > 0) return;

  await db.insert(users).values([
    { id: "u_demo", email: DEMO_EMAIL, name: "Oytun Bölükbaşı", bio: "Kadıköy’de yaşıyor, planları iyi yapar, tatlıyı unutur.", onboarded: true, createdAt: iso("2026-09-20T08:00:00Z") },
    { id: "u_deniz", email: "deniz@example.com", name: "Deniz Aydın", onboarded: true },
    { id: "u_kk", email: "kosu@example.com", name: "Kadıköy Koşu Kulübü", onboarded: true },
  ]);

  await db.insert(plans).values([
    {
      id: "p_ece30",
      code: "ece30",
      ownerId: "u_demo",
      status: "published",
      title: "Ece 30 Oluyor",
      titleFont: "eklektik",
      themeId: "kor",
      posterText: "30",
      description: "Ece’ye sürpriz yok: iyi yemek, uzun sohbet, sonra Moda sahilinde yürüyüş.\n\nMasrafı bölüşüyoruz; hediye yerine güzel bir not yeter. Yağmur yağarsa iç mekân hazır.",
      startsAt: iso("2026-10-17T17:00:00.000Z"),
      endsAt: iso("2026-10-17T20:30:00.000Z"),
      location: { name: "Moda Deniz Kulübü Terası", address: "Caferağa, Moda Cad. 12, Kadıköy", district: "Moda, Kadıköy", display: "district", lat: 40.9819, lng: 29.0245 },
      plusOnesMax: 1,
      requirePlusOneNames: true,
      requireApproval: true,
      questions: [
        { id: "q1", type: "short", text: "Diyet kısıtın var mı?", required: false },
        { id: "q2", type: "single", text: "Sahil yürüyüşüne katılır mısın?", required: true, options: ["Evet", "Hayır", "Bakarız"] },
      ],
      cost: { mode: "fixed", amountTry: 450, iban: "TR33 0006 1005 1978 6457 8413 26", papara: "@oytun", note: "Ece 30 – adın" },
      views: 212,
      publishedAt: iso("2026-09-24T08:00:00Z"),
    },
    {
      id: "p_sahil",
      code: "sahil",
      ownerId: "u_kk",
      status: "published",
      title: "Caddebostan Sahil Koşusu",
      titleFont: "klasik",
      themeId: "derin-deniz",
      posterText: "Sahil\nKoşusu\n6:30",
      description: "Pazar sabahı 5K, tempo serbest. Koşu sonrası Caddebostan’da kahvaltı.",
      startsAt: iso("2026-10-11T03:30:00.000Z"),
      endsAt: iso("2026-10-11T05:00:00.000Z"),
      location: { name: "Caddebostan Sahil Parkı", address: "Caddebostan Sahil Yolu, Kadıköy", district: "Caddebostan, Kadıköy", display: "full", lat: 40.9636, lng: 29.0662 },
      views: 480,
      publishedAt: iso("2026-09-20T08:00:00Z"),
    },
    {
      id: "p_mangal",
      code: "mangal",
      ownerId: "u_demo",
      status: "published",
      title: "Polonezköy Mangal",
      titleFont: "eklektik",
      themeId: "zeytinlik",
      posterText: "mangal",
      description: "Ormanın içinde mangal, uzun masa, akşama doğru ateş başı. Et ve kömür bizden, meze ve tatlı sizden.",
      dateTbd: true,
      location: { name: "Polonezköy Tabiat Parkı", address: "Polonezköy, Beykoz", district: "Polonezköy, Beykoz", display: "district", lat: 41.1129, lng: 29.1291 },
      plusOnesMax: 2,
      views: 61,
      publishedAt: iso("2026-09-25T08:00:00Z"),
    },
  ]);

  await db.insert(planHosts).values([
    { planId: "p_ece30", userId: "u_demo", role: "owner", position: 0 },
    { planId: "p_ece30", userId: "u_deniz", role: "cohost", position: 1 },
    { planId: "p_sahil", userId: "u_kk", role: "owner", position: 0 },
    { planId: "p_mangal", userId: "u_demo", role: "owner", position: 0 },
  ]);

  const G = (id: string, planId: string, name: string, status: string, at: string, extra: Partial<typeof guests.$inferInsert> = {}) => ({ id, planId, name, status, createdAt: iso(at), updatedAt: iso(at), ...extra });
  await db.insert(guests).values([
    G("g1", "p_ece30", "Selin Arslan", "going", "2026-09-25T10:00:00Z", { plusOnes: 1, plusOneNames: ["Ayşe"], answers: { q1: "Vejetaryen", q2: "Evet" }, checkedIn: true, paid: true }),
    G("g2", "p_ece30", "Mert Kaya", "going", "2026-09-27T07:55:00Z", { note: "Tatlıyı ben getiriyorum, kimse uğraşmasın.", answers: { q2: "Evet" }, paid: true }),
    G("g3", "p_ece30", "Buse Yılmaz", "going", "2026-09-27T07:46:00Z", { answers: { q1: "Gluten yok", q2: "Bakarız" } }),
    G("g4", "p_ece30", "Ege Çelik", "maybe", "2026-09-27T07:00:00Z", { note: "Vardiya belli olunca yazarım" }),
    G("g5", "p_ece30", "Gökçe Tan", "going", "2026-09-26T18:00:00Z", { plusOnes: 1, checkedIn: true, paid: true }),
    G("g6", "p_ece30", "İrem Koç", "maybe", "2026-09-26T12:00:00Z"),
    G("g7", "p_ece30", "Deniz Aydın", "no", "2026-09-26T09:00:00Z", { note: "Şehir dışındayım, iyi eğlenceler" }),
    G("g8", "p_ece30", "Cem Demir", "pending", "2026-09-27T04:00:00Z", { note: "Listeye alın dedi" }),
    G("g9", "p_ece30", "Zeynep Ak", "pending", "2026-09-26T11:00:00Z", { plusOnes: 1 }),
    G("g10", "p_ece30", "Onur Kara", "invited", "2026-09-24T09:00:00Z"),
    ...Array.from({ length: 9 }, (_, i) => G(`x${i}`, "p_ece30", `Misafir ${i + 1}`, "going", "2026-09-24T09:00:00Z", { paid: i < 6 })),
    G("s_me", "p_sahil", "Oytun Bölükbaşı", "going", "2026-09-26T10:00:00Z", { userId: "u_demo", email: DEMO_EMAIL }),
    ...Array.from({ length: 23 }, (_, i) => G(`r${i}`, "p_sahil", `Koşucu ${i + 1}`, "going", "2026-09-24T09:00:00Z")),
    ...Array.from({ length: 13 }, (_, i) => G(`m${i}`, "p_mangal", `Davetli ${i + 1}`, "invited", "2026-09-25T09:00:00Z")),
  ]);

  await db.insert(pollOptions).values([
    { id: "o1", planId: "p_mangal", startsAt: iso("2026-10-17T14:00:00.000Z"), position: 0 },
    { id: "o2", planId: "p_mangal", startsAt: iso("2026-10-23T14:30:00.000Z"), position: 1 },
    { id: "o3", planId: "p_mangal", startsAt: iso("2026-10-24T13:30:00.000Z"), position: 2 },
  ]);
  // Tallies from the canvas: o1 9/3/1 · o2 5/4/3 · o3 7/2/2 (13 voters, some skipped an option).
  const tally: Record<string, [number, number, number]> = { o1: [9, 3, 1], o2: [5, 4, 3], o3: [7, 2, 2] };
  const votes: (typeof pollVotes.$inferInsert)[] = [];
  for (const [optionId, [yes, maybe, no]] of Object.entries(tally)) {
    const seq = [...Array(yes).fill("yes"), ...Array(maybe).fill("maybe"), ...Array(no).fill("no")] as string[];
    seq.forEach((vote, i) => votes.push({ optionId, guestId: `m${i}`, vote }));
  }
  await db.insert(pollVotes).values(votes);

  await db.insert(feedItems).values([
    { id: "f1", planId: "p_ece30", actorId: "g2", kind: "rsvp", text: "Tatlıyı ben getiriyorum, kimse uğraşmasın.", createdAt: iso("2026-09-27T07:55:00Z") },
    { id: "f2", planId: "p_ece30", actorId: "g3", kind: "rsvp", createdAt: iso("2026-09-27T07:46:00Z") },
    { id: "f3", planId: "p_ece30", actorId: "g4", kind: "rsvp", createdAt: iso("2026-09-27T07:00:00Z") },
    { id: "f4", planId: "p_ece30", actorId: "u_demo", kind: "blast", text: "Terası 20:00’de açıyorlar, erken gelenler için sahilde buluşalım.", createdAt: iso("2026-09-26T15:00:00Z") },
  ]);
  await db.insert(blasts).values([{ id: "b1", planId: "p_ece30", userId: "u_demo", toLabel: "Geliyor + Belki", count: 17, text: "Adres güncellendi: Moda Deniz Kulübü Terası. Kapıda “Ece 30” de.", createdAt: iso("2026-09-26T15:40:00Z") }]);

  await db.insert(notifications).values([
    { id: "n1", userId: "u_demo", planId: "p_ece30", kind: "rsvp", actorName: "Mert Kaya", text: "Mert Ece 30 Oluyor için “Geliyorum” dedi. 14 kişi oldunuz.", role: "host", createdAt: iso("2026-09-27T07:55:00Z") },
    { id: "n2", userId: "u_demo", planId: "p_ece30", kind: "comment", actorName: "Buse Yılmaz", text: "Buse yorum yazdı: “Gluten yok ama pasta serbest”", role: "host", createdAt: iso("2026-09-27T07:46:00Z") },
    { id: "n3", userId: "u_demo", planId: "p_ece30", kind: "approval", actorName: "Cem Demir", text: "Cem listeye alınmak istiyor. Onayla ya da reddet.", role: "host", createdAt: iso("2026-09-27T04:00:00Z") },
    { id: "n4", userId: "u_demo", planId: "p_sahil", kind: "reminder", actorName: "Kadıköy Koşu Kulübü", text: "Yarın 06:30 — Caddebostan Sahil Koşusu. Buluşma: Kalamış iskelesi.", role: "guest", readAt: iso("2026-09-27T03:00:00Z"), createdAt: iso("2026-09-27T02:00:00Z") },
    { id: "n5", userId: "u_demo", planId: "p_ece30", kind: "cohost", actorName: "Deniz Aydın", text: "Deniz ortak düzenleyen davetini kabul etti.", role: "host", readAt: iso("2026-09-26T19:00:00Z"), createdAt: iso("2026-09-26T18:10:00Z") },
    { id: "n6", userId: "u_demo", planId: "p_sahil", kind: "album", actorName: "Ege Çelik", text: "Ege albüme 3 fotoğraf ekledi.", role: "guest", readAt: iso("2026-09-26T19:00:00Z"), createdAt: iso("2026-09-26T16:02:00Z") },
    { id: "n7", userId: "u_demo", planId: "p_ece30", kind: "rsvp", actorName: "Selin Arslan", text: "Selin +1 ile geliyor: Ayşe.", role: "host", readAt: iso("2026-09-26T19:00:00Z"), createdAt: iso("2026-09-26T09:40:00Z") },
  ]);
}
