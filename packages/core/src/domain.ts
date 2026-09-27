import { z } from "zod";

/**
 * Domain model for partile. Terminology follows CLAUDE.md:
 * plan (event), davetiye (invite), katılım (RSVP), düzenleyen (host).
 * Zod schemas are the validation source for API routes and forms.
 */

export const RsvpStatus = z.enum(["going", "maybe", "no", "invited", "pending"]);
export type RsvpStatus = z.infer<typeof RsvpStatus>;

/** Turkish labels for RSVP status, used in UI. */
export const rsvpLabel: Record<RsvpStatus, string> = {
  going: "Geliyorum",
  maybe: "Belki",
  no: "Gelemiyorum",
  invited: "Davetli",
  pending: "Onay bekliyor",
};

export const Visibility = z.enum(["private", "public"]);
export type Visibility = z.infer<typeof Visibility>;

export const CostMode = z.enum(["off", "fixed", "pay_what_you_can"]);
export type CostMode = z.infer<typeof CostMode>;

export const QuestionType = z.enum(["short", "single"]);

export const Question = z.object({
  id: z.string(),
  type: QuestionType,
  text: z.string().min(1).max(140),
  required: z.boolean().default(false),
  options: z.array(z.string().min(1).max(60)).max(8).optional(),
});
export type Question = z.infer<typeof Question>;

export const CostSettings = z.object({
  mode: CostMode.default("off"),
  amountTry: z.number().int().positive().optional(),
  iban: z.string().trim().optional(),
  papara: z.string().trim().optional(),
  note: z.string().max(80).optional(),
});
export type CostSettings = z.infer<typeof CostSettings>;

export const RsvpStyle = z.enum(["icons", "text", "single", "emoji"]);
export type RsvpStyle = z.infer<typeof RsvpStyle>;
export const rsvpStyleLabel: Record<RsvpStyle, string> = { icons: "Simgeler", text: "Metin", single: "Tek düğme", emoji: "Emoji" };

export const EffectId = z.enum(["none", "confetti", "sparkle", "snow", "balloons", "hearts", "fireworks"]);
export type EffectId = z.infer<typeof EffectId>;
export const effectLabel: Record<EffectId, string> = { none: "Yok", confetti: "Konfeti", sparkle: "Işıltı", snow: "Kar", balloons: "Balon", hearts: "Kalp", fireworks: "Havai fişek" };
/** Particle layer shown over the invitation (`Effects` artboard). */
export const EffectSettings = z.object({
  id: EffectId.default("none"),
  level: z.enum(["low", "mid", "high"]).default("mid"),
  mode: z.enum(["once", "loop"]).default("once"),
});
export type EffectSettings = z.infer<typeof EffectSettings>;

export const PollOption = z.object({
  id: z.string(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional(),
});
export type PollOption = z.infer<typeof PollOption>;

/** Slug used in the share link: getpartile.com/e/{code}. */
export const PlanCode = z.string().regex(/^[a-z0-9-]{4,32}$/);

export const PlanDraft = z.object({
  title: z.string().trim().min(1, "Planın adı gerekli").max(80),
  titleFont: z.string().default("klasik"),
  themeId: z.string().default("kor"),
  posterUrl: z.string().url().optional(),
  /** Text rendered on the generated poster when there is no image (template pick). */
  posterText: z.string().max(24).optional(),
  description: z.string().max(2000).optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  dateTbd: z.boolean().default(false),
  poll: z.array(PollOption).max(6).optional(),
  location: z
    .object({
      name: z.string().max(120).optional(),
      address: z.string().max(240).optional(),
      district: z.string().max(60).optional(),
      /** "district" hides the full address until the guest RSVPs. */
      display: z.enum(["district", "full"]).default("district"),
      lat: z.number().optional(),
      lng: z.number().optional(),
    })
    .optional(),
  capacity: z.number().int().positive().optional(),
  visibility: Visibility.default("private"),
  plusOnesMax: z.number().int().min(0).max(5).default(1),
  requirePlusOneNames: z.boolean().default(false),
  requireApproval: z.boolean().default(false),
  allowMaybe: z.boolean().default(true),
  /** How the Geliyorum / Belki / Gelemiyorum choice is drawn on the invitation. */
  rsvpStyle: RsvpStyle.default("icons"),
  effect: EffectSettings.optional(),
  guestsCanInviteMutuals: z.boolean().default(true),
  remindersEnabled: z.boolean().default(true),
  /** Display & privacy — guest list and feed are always hidden pre-RSVP. */
  showGuestNames: z.boolean().default(true),
  showGuestCount: z.boolean().default(true),
  showTimestamps: z.boolean().default(true),
  /** Photo album. */
  albumGuestsCanUpload: z.boolean().default(true),
  albumFilter: z.enum(["none", "warm", "mono"]).default("none"),
  questions: z.array(Question).max(10).default([]),
  cost: CostSettings.default({ mode: "off" }),
  extras: z
    .object({
      link: z.string().url().optional(),
      playlist: z.string().url().optional(),
      registry: z.string().url().optional(),
      dressCode: z.string().max(80).optional(),
    })
    .optional(),
});
export type PlanDraft = z.infer<typeof PlanDraft>;

export const Rsvp = z.object({
  status: RsvpStatus,
  name: z.string().trim().min(1).max(60),
  email: z.string().trim().email(),
  plusOnes: z.number().int().min(0).max(5).default(0),
  plusOneNames: z.array(z.string().max(60)).optional(),
  note: z.string().max(280).optional(),
  answers: z.record(z.string(), z.string().max(280)).optional(),
  followHost: z.boolean().default(true),
});
export type Rsvp = z.infer<typeof Rsvp>;

/** E-mail verification (Resend): 6-digit code or magic link, no passwords. */
export const VerificationCode = z.string().regex(/^\d{6}$/, "6 haneli kod");
export const VERIFICATION_TTL_MINUTES = 10;
export const MAX_BLASTS_PER_PLAN = 10;
