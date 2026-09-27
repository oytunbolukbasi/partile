import type { PlanDraft, RsvpStatus } from "@partile/core";

/**
 * Development fixtures until the database lands. `ece30` mirrors the sample plan on the design canvas.
 * A published plan = draft + code + hosts + guests.
 */
export type Host = { id: string; name: string; initials: string; gradient: string };
export type Guest = { id: string; name: string; initials: string; gradient: string; status: RsvpStatus; plusOnes?: number; plusOneNames?: string[]; note?: string; answers?: Record<string, string>; checkedIn?: boolean; at: string };
export type PollVotes = Record<string, { yes: number; maybe: number; no: number }>;
export type Blast = { id: string; at: string; to: string; count: number; text: string };
export type Notification = { id: string; code: string; initials: string; gradient: string; kind: "rsvp" | "comment" | "approval" | "reminder" | "cohost" | "album"; text: string; at: string; unread: boolean; role: "host" | "guest" };
export type FeedItem = { id: string; guestId: string; kind: "rsvp" | "comment" | "blast"; text?: string; at: string };

export type Plan = PlanDraft & {
  code: string;
  hosts: Host[];
  guests: Guest[];
  feed: FeedItem[];
  blasts: Blast[];
  views: number;
  /** Tally per poll option id, when the plan has a date poll. */
  pollVotes?: PollVotes;
  publishedAt: string;
};

const g = (a: string, b: string) => `linear-gradient(135deg, ${a}, ${b})`;

export const plans: Record<string, Plan> = {
  ece30: {
    code: "ece30",
    title: "Ece 30 Oluyor",
    titleFont: "eklektik",
    themeId: "kor",
    posterText: "30",
    description: "Ece’ye sürpriz yok: iyi yemek, uzun sohbet, sonra Moda sahilinde yürüyüş.\n\nMasrafı bölüşüyoruz; hediye yerine güzel bir not yeter. Yağmur yağarsa iç mekân hazır.",
    startsAt: "2026-10-17T17:00:00.000Z",
    endsAt: "2026-10-17T20:30:00.000Z",
    dateTbd: false,
    location: { name: "Moda Deniz Kulübü Terası", address: "Caferağa, Moda Cad. 12, Kadıköy", district: "Moda, Kadıköy", display: "district", lat: 40.9819, lng: 29.0245 },
    visibility: "private",
    plusOnesMax: 1,
    requirePlusOneNames: true,
    requireApproval: true,
    allowMaybe: true,
    guestsCanInviteMutuals: true,
    remindersEnabled: true,
    showGuestNames: true,
    showGuestCount: true,
    showTimestamps: true,
    albumGuestsCanUpload: true,
    albumFilter: "none",
    questions: [
      { id: "q1", type: "short", text: "Diyet kısıtın var mı?", required: false },
      { id: "q2", type: "single", text: "Sahil yürüyüşüne katılır mısın?", required: true, options: ["Evet", "Hayır", "Bakarız"] },
    ],
    cost: { mode: "fixed", amountTry: 450, iban: "TR33 0006 1005 1978 6457 8413 26", papara: "@oytun", note: "Ece 30 – adın" },
    hosts: [
      { id: "h1", name: "Oytun", initials: "OB", gradient: g("#1EC9B0", "#FFB020") },
      { id: "h2", name: "Deniz", initials: "DA", gradient: g("#FF6A3D", "#FFD166") },
    ],
    guests: [
      { id: "g1", name: "Selin Arslan", initials: "SA", gradient: g("#FFD166", "#FF6A3D"), status: "going", plusOnes: 1, plusOneNames: ["Ayşe"], answers: { q1: "Vejetaryen", q2: "Evet" }, checkedIn: true, at: "2026-09-25T10:00:00Z" },
      { id: "g2", name: "Mert Kaya", initials: "MK", gradient: g("#1EC9B0", "#0E7C86"), status: "going", note: "Tatlıyı ben getiriyorum, kimse uğraşmasın.", answers: { q2: "Evet" }, at: "2026-09-27T07:55:00Z" },
      { id: "g3", name: "Buse Yılmaz", initials: "BY", gradient: g("#F59E0B", "#C2410C"), status: "going", answers: { q1: "Gluten yok", q2: "Bakarız" }, at: "2026-09-27T07:46:00Z" },
      { id: "g4", name: "Ege Çelik", initials: "EÇ", gradient: g("#38BDF8", "#1D4ED8"), status: "maybe", note: "Vardiya belli olunca yazarım", at: "2026-09-27T07:00:00Z" },
      { id: "g5", name: "Gökçe Tan", initials: "GT", gradient: g("#A8B545", "#4B5D2A"), status: "going", plusOnes: 1, checkedIn: true, at: "2026-09-26T18:00:00Z" },
      { id: "g8", name: "Cem Demir", initials: "CD", gradient: g("#FFB020", "#FF6A3D"), status: "pending", note: "Listeye alın dedi", at: "2026-09-27T04:00:00Z" },
      { id: "g9", name: "Zeynep Ak", initials: "ZA", gradient: g("#1EC9B0", "#FFD166"), status: "pending", plusOnes: 1, at: "2026-09-26T11:00:00Z" },
      { id: "g10", name: "Onur Kara", initials: "OK", gradient: g("#CFC9C0", "#7A756D"), status: "invited", at: "2026-09-24T09:00:00Z" },
      { id: "g6", name: "İrem Koç", initials: "İK", gradient: g("#FB7185", "#B91C3C"), status: "maybe", at: "2026-09-26T12:00:00Z" },
      { id: "g7", name: "Deniz Aydın", initials: "DA", gradient: g("#FF6A3D", "#FFD166"), status: "no", note: "Şehir dışındayım, iyi eğlenceler", at: "2026-09-26T09:00:00Z" },
      ...Array.from({ length: 9 }, (_, i) => ({ id: `x${i}`, name: `Misafir ${i + 1}`, initials: "M", gradient: g("#CFC9C0", "#7A756D"), status: "going" as RsvpStatus, at: "2026-09-24T09:00:00Z" })),
    ],
    feed: [
      { id: "f1", guestId: "g2", kind: "rsvp", text: "Tatlıyı ben getiriyorum, kimse uğraşmasın.", at: "2026-09-27T07:55:00Z" },
      { id: "f2", guestId: "g3", kind: "rsvp", at: "2026-09-27T07:46:00Z" },
      { id: "f3", guestId: "g4", kind: "rsvp", at: "2026-09-27T07:00:00Z" },
      { id: "f4", guestId: "h1", kind: "blast", text: "Terası 20:00’de açıyorlar, erken gelenler için sahilde buluşalım.", at: "2026-09-26T15:00:00Z" },
    ],
    blasts: [{ id: "b1", at: "2026-09-26T15:40:00Z", to: "Geliyor + Belki", count: 17, text: "Adres güncellendi: Moda Deniz Kulübü Terası. Kapıda “Ece 30” de." }],
    views: 212,
    publishedAt: "2026-09-24T08:00:00Z",
  },
  sahil: {
    code: "sahil",
    title: "Caddebostan Sahil Koşusu",
    titleFont: "klasik",
    themeId: "derin-deniz",
    posterText: "Sahil\nKoşusu\n6:30",
    description: "Pazar sabahı 5K, tempo serbest. Koşu sonrası Caddebostan’da kahvaltı.",
    startsAt: "2026-10-11T03:30:00.000Z",
    endsAt: "2026-10-11T05:00:00.000Z",
    dateTbd: false,
    location: { name: "Caddebostan Sahil Parkı", address: "Caddebostan Sahil Yolu, Kadıköy", district: "Caddebostan, Kadıköy", display: "full", lat: 40.9636, lng: 29.0662 },
    visibility: "private",
    plusOnesMax: 0,
    requirePlusOneNames: false,
    requireApproval: false,
    allowMaybe: true,
    guestsCanInviteMutuals: true,
    remindersEnabled: true,
    showGuestNames: true,
    showGuestCount: true,
    showTimestamps: true,
    albumGuestsCanUpload: true,
    albumFilter: "none",
    questions: [],
    cost: { mode: "off" },
    hosts: [{ id: "kk", name: "Kadıköy Koşu Kulübü", initials: "KK", gradient: g("#FF6A3D", "#FFD166") }],
    guests: [
      { id: "me", name: "Oytun Bölükbaşı", initials: "OB", gradient: g("#1EC9B0", "#FFB020"), status: "going", at: "2026-09-26T10:00:00Z" },
      ...Array.from({ length: 23 }, (_, i) => ({ id: `r${i}`, name: `Koşucu ${i + 1}`, initials: "K", gradient: g("#CFC9C0", "#7A756D"), status: "going" as RsvpStatus, at: "2026-09-24T09:00:00Z" })),
    ],
    feed: [],
    blasts: [],
    views: 480,
    publishedAt: "2026-09-20T08:00:00Z",
  },
  mangal: {
    code: "mangal",
    title: "Polonezköy Mangal",
    titleFont: "eklektik",
    themeId: "zeytinlik",
    posterText: "mangal",
    description: "Ormanın içinde mangal, uzun masa, akşama doğru ateş başı. Et ve kömür bizden, meze ve tatlı sizden.",
    dateTbd: true,
    poll: [
      { id: "o1", startsAt: "2026-10-17T14:00:00.000Z" },
      { id: "o2", startsAt: "2026-10-23T14:30:00.000Z" },
      { id: "o3", startsAt: "2026-10-24T13:30:00.000Z" },
    ],
    pollVotes: { o1: { yes: 9, maybe: 3, no: 1 }, o2: { yes: 5, maybe: 4, no: 3 }, o3: { yes: 7, maybe: 2, no: 2 } },
    location: { name: "Polonezköy Tabiat Parkı", address: "Polonezköy, Beykoz", district: "Polonezköy, Beykoz", display: "district", lat: 41.1129, lng: 29.1291 },
    visibility: "private",
    plusOnesMax: 2,
    requirePlusOneNames: false,
    requireApproval: false,
    allowMaybe: true,
    guestsCanInviteMutuals: true,
    remindersEnabled: true,
    showGuestNames: true,
    showGuestCount: true,
    showTimestamps: true,
    albumGuestsCanUpload: true,
    albumFilter: "none",
    questions: [],
    cost: { mode: "off" },
    hosts: [{ id: "h1", name: "Oytun", initials: "OB", gradient: g("#1EC9B0", "#FFB020") }],
    guests: Array.from({ length: 13 }, (_, i) => ({ id: `m${i}`, name: `Davetli ${i + 1}`, initials: "D", gradient: g("#A8B545", "#4B5D2A"), status: "invited" as RsvpStatus, at: "2026-09-25T09:00:00Z" })),
    feed: [],
    blasts: [],
    views: 61,
    publishedAt: "2026-09-25T08:00:00Z",
  },
};

/** The signed-in viewer until accounts land. */
export const me = { id: "h1", name: "Oytun", initials: "OB", gradient: g("#1EC9B0", "#FFB020") };

export type PlanRole = "host" | RsvpStatus;
/** How the viewer relates to a plan: hosting it, or their RSVP. */
export const roleFor = (plan: Plan): PlanRole | null => {
  if (plan.hosts.some((h) => h.id === me.id)) return "host";
  return plan.guests.find((g) => g.id === "me")?.status ?? null;
};

/** Plans on the viewer's home, newest date first. */
export const myPlans = (): { plan: Plan; role: PlanRole }[] =>
  Object.values(plans)
    .map((plan) => ({ plan, role: roleFor(plan) }))
    .filter((x): x is { plan: Plan; role: PlanRole } => x.role !== null)
    .sort((a, b) => (a.plan.startsAt ?? "").localeCompare(b.plan.startsAt ?? ""));

export const getPlan = (code: string): Plan | undefined => plans[code];

export const countByStatus = (guests: Guest[]) =>
  guests.reduce(
    (acc, g) => {
      acc[g.status] += 1 + (g.status === "going" ? (g.plusOnes ?? 0) : 0);
      return acc;
    },
    { going: 0, maybe: 0, no: 0, invited: 0, pending: 0 } as Record<RsvpStatus, number>,
  );

/** Notification feed for the viewer (`Notifications` artboard). */
export const notifications: Notification[] = [
  { id: "n1", code: "ece30", initials: "MK", gradient: g("#1EC9B0", "#0E7C86"), kind: "rsvp", text: "Mert Ece 30 Oluyor için “Geliyorum” dedi. 14 kişi oldunuz.", at: "2026-09-27T07:55:00Z", unread: true, role: "host" },
  { id: "n2", code: "ece30", initials: "BY", gradient: g("#F59E0B", "#C2410C"), kind: "comment", text: "Buse yorum yazdı: “Gluten yok ama pasta serbest”", at: "2026-09-27T07:46:00Z", unread: true, role: "host" },
  { id: "n3", code: "ece30", initials: "CD", gradient: g("#FFB020", "#FF6A3D"), kind: "approval", text: "Cem listeye alınmak istiyor. Onayla ya da reddet.", at: "2026-09-27T04:00:00Z", unread: true, role: "host" },
  { id: "n4", code: "sahil", initials: "KK", gradient: g("#FF6A3D", "#FFD166"), kind: "reminder", text: "Yarın 06:30 — Caddebostan Sahil Koşusu. Buluşma: Kalamış iskelesi.", at: "2026-09-27T02:00:00Z", unread: false, role: "guest" },
  { id: "n5", code: "ece30", initials: "DA", gradient: g("#FF6A3D", "#FFD166"), kind: "cohost", text: "Deniz ortak düzenleyen davetini kabul etti.", at: "2026-09-26T18:10:00Z", unread: false, role: "host" },
  { id: "n6", code: "sahil", initials: "EÇ", gradient: g("#38BDF8", "#1D4ED8"), kind: "album", text: "Ege albüme 3 fotoğraf ekledi.", at: "2026-09-26T16:02:00Z", unread: false, role: "guest" },
  { id: "n7", code: "ece30", initials: "SA", gradient: g("#FFD166", "#FF6A3D"), kind: "rsvp", text: "Selin +1 ile geliyor: Ayşe.", at: "2026-09-26T09:40:00Z", unread: false, role: "host" },
];
