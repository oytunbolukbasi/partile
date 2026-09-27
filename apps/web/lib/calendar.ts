import { planUrl } from "@partile/core";

/** Minimal plan shape needed for calendar links (works with drafts and published plans). */
export type CalendarPlan = { code: string; title: string; description?: string; startsAt?: string; endsAt?: string; location?: { name?: string; address?: string; district?: string; display?: "district" | "full" } };

const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
/** Default length when the host set no end time. */
const DEFAULT_HOURS = 3;
const endOf = (p: CalendarPlan) => p.endsAt ?? new Date(new Date(p.startsAt!).getTime() + DEFAULT_HOURS * 3600 * 1000).toISOString();
/** Guests who have not answered see the district only; the calendar entry follows the same rule. */
export const locationText = (p: CalendarPlan, full: boolean) => (full && p.location?.display === "full" ? [p.location.name, p.location.address].filter(Boolean).join(", ") : p.location?.district ?? p.location?.name ?? "");

export function googleCalendarUrl(p: CalendarPlan, full = true): string | null {
  if (!p.startsAt) return null;
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: p.title,
    dates: `${stamp(p.startsAt)}/${stamp(endOf(p))}`,
    details: `${p.description ?? ""}\n\n${planUrl(p.code)}`.trim(),
    location: locationText(p, full),
    ctz: "Europe/Istanbul",
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** RFC 5545 text for Apple Calendar, Outlook and friends. */
export function icsText(p: CalendarPlan, full = true): string | null {
  if (!p.startsAt) return null;
  const now = stamp(new Date().toISOString());
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//partile//getpartile.com//TR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${p.code}@getpartile.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${stamp(p.startsAt)}`,
    `DTEND:${stamp(endOf(p))}`,
    `SUMMARY:${esc(p.title)}`,
    `DESCRIPTION:${esc(`${p.description ?? ""}\n\n${planUrl(p.code)}`.trim())}`,
    `LOCATION:${esc(locationText(p, full))}`,
    `URL:${planUrl(p.code)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(p.title)} 2 saat sonra`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
