import type { PlanDraft, RsvpStatus } from "./domain";

/**
 * Read models the screens render. The data layer (`@partile/db`) assembles these
 * from tables; hosts never receive guest e-mails.
 */
export type Host = { id: string; name: string; initials: string; gradient: string; accepted?: boolean; owner?: boolean };
export type Guest = {
  id: string;
  /** Set once the guest verified their e-mail; lets hosts message them. */
  userId?: string;
  name: string;
  initials: string;
  gradient: string;
  status: RsvpStatus;
  plusOnes?: number;
  plusOneNames?: string[];
  note?: string;
  answers?: Record<string, string>;
  checkedIn?: boolean;
  paid?: boolean;
  at: string;
};
export type FeedItem = { id: string; guestId: string; kind: "rsvp" | "comment" | "blast"; text?: string; at: string };
export type Photo = { id: string; url: string; userId: string; name: string; at: string };
export type Blast = { id: string; at: string; to: string; count: number; text: string };
export type PollVotes = Record<string, { yes: number; maybe: number; no: number }>;
export type Notification = {
  id: string;
  code: string;
  planTitle: string;
  initials: string;
  gradient: string;
  kind: "rsvp" | "comment" | "approval" | "reminder" | "cohost" | "album" | "blast" | "message" | "follow";
  text: string;
  at: string;
  unread: boolean;
  role: "host" | "guest";
};

export type Plan = PlanDraft & {
  id: string;
  code: string;
  hosts: Host[];
  guests: Guest[];
  feed: FeedItem[];
  blasts: Blast[];
  photos: Photo[];
  views: number;
  /** Tally per poll option id, when the plan has a date poll. */
  pollVotes?: PollVotes;
  status: "draft" | "published" | "cancelled";
  publishedAt?: string;
};

export type PlanRole = "host" | RsvpStatus;

export const countByStatus = (guests: Guest[]) =>
  guests.reduce(
    (acc, g) => {
      acc[g.status] += 1 + (g.status === "going" ? (g.plusOnes ?? 0) : 0);
      return acc;
    },
    { going: 0, maybe: 0, no: 0, invited: 0, pending: 0 } as Record<RsvpStatus, number>,
  );

/** Avatar gradient derived from a name so the same person always gets the same colours. */
const PALETTE = [
  ["#1EC9B0", "#FFB020"],
  ["#FF6A3D", "#FFD166"],
  ["#FFD166", "#FF6A3D"],
  ["#1EC9B0", "#0E7C86"],
  ["#F59E0B", "#C2410C"],
  ["#38BDF8", "#1D4ED8"],
  ["#A8B545", "#4B5D2A"],
  ["#FB7185", "#B91C3C"],
];
export const gradientFor = (seed: string): string => {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const [a, b] = PALETTE[h % PALETTE.length]!;
  return `linear-gradient(135deg, ${a}, ${b})`;
};

export type Conversation = {
  id: string;
  planCode: string;
  planTitle: string;
  /** The other party. */
  other: { id: string; name: string; initials: string; gradient: string };
  /** The viewer's role in this thread. */
  role: "host" | "guest";
  otherRoleLabel: string;
  lastText?: string;
  lastAt: string;
  unread: number;
};
export type Message = { id: string; senderId: string; text: string; at: string; read: boolean };

/** A dated plan is over once it ends (or 6 hours after it starts when there is no end time). TBD plans never end. */
export const isPlanOver = (plan: { startsAt?: string; endsAt?: string; dateTbd?: boolean }, now = Date.now()): boolean => {
  if (plan.dateTbd || !plan.startsAt) return false;
  const end = plan.endsAt ? new Date(plan.endsAt).getTime() : new Date(plan.startsAt).getTime() + 6 * 3600e3;
  return now > end;
};
