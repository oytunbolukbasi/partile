import { NextResponse } from "next/server";
import { dueReminders, logReminder } from "@partile/db";
import { sendReminderMail } from "@/lib/mail";

/**
 * Scheduled reminders. Railway cron calls this hourly with `Authorization: Bearer $CRON_SECRET`.
 * rsvp → 7 days before (invited + maybe), event → 2 hours before (going). Each fires once per plan.
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
  return NextResponse.json({ now: now.toISOString(), sent: report });
}

export const POST = GET;
