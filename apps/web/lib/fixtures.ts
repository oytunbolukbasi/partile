import type { PlanDraft, RsvpStatus } from "@partile/core";

/**
 * Development fixtures until the database lands. `ece30` mirrors the sample plan on the design canvas.
 * A published plan = draft + code + hosts + guests.
 */
export type Host = { id: string; name: string; initials: string; gradient: string };
export type Guest = { id: string; name: string; initials: string; gradient: string; status: RsvpStatus; plusOnes?: number; note?: string; at: string };
export type FeedItem = { id: string; guestId: string; kind: "rsvp" | "comment" | "blast"; text?: string; at: string };

export type Plan = PlanDraft & {
  code: string;
  hosts: Host[];
  guests: Guest[];
  feed: FeedItem[];
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
    requireApproval: false,
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
      { id: "g1", name: "Selin Arslan", initials: "SA", gradient: g("#FFD166", "#FF6A3D"), status: "going", plusOnes: 1, at: "2026-09-25T10:00:00Z" },
      { id: "g2", name: "Mert Kaya", initials: "MK", gradient: g("#1EC9B0", "#0E7C86"), status: "going", note: "Tatlıyı ben getiriyorum, kimse uğraşmasın.", at: "2026-09-27T07:55:00Z" },
      { id: "g3", name: "Buse Yılmaz", initials: "BY", gradient: g("#F59E0B", "#C2410C"), status: "going", at: "2026-09-27T07:46:00Z" },
      { id: "g4", name: "Ege Çelik", initials: "EÇ", gradient: g("#38BDF8", "#1D4ED8"), status: "maybe", at: "2026-09-27T07:00:00Z" },
      { id: "g5", name: "Gökçe Tan", initials: "GT", gradient: g("#A8B545", "#4B5D2A"), status: "going", plusOnes: 1, at: "2026-09-26T18:00:00Z" },
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
    publishedAt: "2026-09-24T08:00:00Z",
  },
};

export const getPlan = (code: string): Plan | undefined => plans[code];

export const countByStatus = (guests: Guest[]) =>
  guests.reduce(
    (acc, g) => {
      acc[g.status] += 1 + (g.status === "going" ? (g.plusOnes ?? 0) : 0);
      return acc;
    },
    { going: 0, maybe: 0, no: 0, invited: 0, pending: 0 } as Record<RsvpStatus, number>,
  );
