import { NextResponse } from "next/server";
import { dueLaterReminders, dueReminders, logReminder, markLaterReminderSent } from "@partile/db";
import { sendLaterReminderMail, sendReminderMail } from "@/lib/mail";

/**
 * Scheduled reminders. Railway cron calls this hourly with `Authorization: Bearer $CRON_SECRET`.
 * rsvp → 7 days before (invited + maybe), event → 2 hours before (going). Each fires once per plan.
 * Also sends due "Sonra hatırlat" requests (one per user and plan).
 * Outside production `?now=<ISO>` simulates the clock for testing.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  if (!secret || auth !== `Bearer ${secret}`) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const url = new URL(req.url);
  const override = process.env.NODE_ENV !== "production" ? url.searchParams.get("now") : null;
  const now = override ? new Date(override) : new Date();
  const due = await dueReminders(now);
  const report: { code: string; kind: string; recipients: number; mailed: number }[] = [];
  for (const d of due) {
    let mailed = 0;
    for (const r of d.recipients) {
      if (!r.email) continue;
      const res = await sendReminderMail(r.email, d.kind, { title: d.plan.title, code: d.plan.code, startsAt: d.plan.startsAt, district: d.plan.location?.district, address: d.plan.location?.address });
      if (res.sent) mailed++;
    }
    const text = d.kind === "rsvp" ? `${d.plan.title} bir hafta sonra — katılımını bildir.` : `${d.plan.title} 2 saat sonra başlıyor.`;
    await logReminder(d.plan.id, d.kind, d.recipients, text);
    report.push({ code: d.plan.code, kind: d.kind, recipients: d.recipients.length, mailed });
  }
  const later = await dueLaterReminders(now);
  for (const l of later) {
    const res = await sendLaterReminderMail(l.email, { title: l.plan.title, code: l.plan.code, startsAt: l.plan.dateTbd ? undefined : l.plan.startsAt, district: l.plan.location?.district, hostName: l.plan.hosts.find((h) => h.owner)?.name });
    await markLaterReminderSent(l.plan.id, l.userId, `${l.plan.title} için hatırlatma: katılımını bildir.`);
    report.push({ code: l.plan.code, kind: "later", recipients: 1, mailed: res.sent ? 1 : 0 });
  }
  return NextResponse.json({ now: now.toISOString(), sent: report });
}

export const POST = GET;
