/** Turkish date/time/money formatting. Time zone is fixed to Europe/Istanbul (TSİ). */

export const TIME_ZONE = "Europe/Istanbul";
export const PUBLIC_HOST = "getpartile.com";

const dayLong = new Intl.DateTimeFormat("tr-TR", { weekday: "long", day: "numeric", month: "long", timeZone: TIME_ZONE });
const dayShort = new Intl.DateTimeFormat("tr-TR", { weekday: "short", day: "numeric", month: "short", timeZone: TIME_ZONE });
const dayPill = new Intl.DateTimeFormat("tr-TR", { weekday: "short", day: "2-digit", month: "2-digit", timeZone: TIME_ZONE });
const time24 = new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TIME_ZONE });

/** "Cumartesi, 17 Ekim" */
export const formatDayLong = (d: Date | string): string => {
  const parts = dayLong.formatToParts(new Date(d));
  const get = (t: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("weekday")}, ${get("day")} ${get("month")}`;
};

/** "Cmt, 17 Eki" */
export const formatDayShort = (d: Date | string): string => {
  const parts = dayShort.formatToParts(new Date(d));
  const get = (t: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("weekday")}, ${get("day")} ${get("month")}`;
};

/** "Cmt 17.10 · 20:00" — the pill on plan cards. */
export const formatPill = (d: Date | string): string => {
  const parts = dayPill.formatToParts(new Date(d));
  const get = (t: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("weekday")} ${get("day")}.${get("month")} · ${formatTime(d)}`;
};

/** "20:00" */
export const formatTime = (d: Date | string): string => time24.format(new Date(d));

/** "20:00 – 23:30" or "20:00" */
export const formatTimeRange = (start: Date | string, end?: Date | string): string =>
  end ? `${formatTime(start)} – ${formatTime(end)}` : formatTime(start);

/** "₺450" */
export const formatTry = (amount: number): string =>
  "₺" + new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(amount);

/** Share link for a plan code. */
export const planUrl = (code: string): string => `https://${PUBLIC_HOST}/e/${code}`;

/** Initials for avatars: "Oytun Bölükbaşı" → "OB". Handles Turkish upper-casing. */
export const initials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toLocaleUpperCase("tr-TR"))
    .join("");
