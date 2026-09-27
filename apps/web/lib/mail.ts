import "server-only";

import { formatDayShort, formatTime, planUrl } from "@partile/core";

/**
 * Transactional e-mail through Resend. Without RESEND_API_KEY nothing is sent and callers fall back
 * to showing the code on screen (development). Templates mirror the e-mail preview in the Blast modal.
 */
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://getpartile.com";
const FROM = process.env.RESEND_FROM ?? "partile <merhaba@getpartile.com>";

export const mailEnabled = () => !!process.env.RESEND_API_KEY;

async function send(to: string | string[], subject: string, html: string, text: string) {
  if (!mailEnabled()) return { sent: false as const };
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({ from: FROM, to, subject, html, text });
  if (error) {
    console.error("[mail] resend error", error);
    return { sent: false as const, error };
  }
  return { sent: true as const };
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Light card on a dark-free background: mail clients ignore most CSS, so everything is inline and simple. */
function shell(body: string, footer: string) {
  return `<!doctype html><html lang="tr"><body style="margin:0;background:#F5F2EC;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:#0C0C0D">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F5F2EC;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#FFFFFF;border:1px solid #E2D7C5;border-radius:16px">
<tr><td style="padding:16px 20px;border-bottom:1px solid #E2D7C5;font-weight:800;font-size:15px">partile</td></tr>
<tr><td style="padding:20px">${body}</td></tr>
<tr><td style="padding:14px 20px;border-top:1px solid #E2D7C5;font-size:11px;color:#5F584F">${footer}</td></tr>
</table></td></tr></table></body></html>`;
}
const button = (href: string, label: string) => `<a href="${href}" style="display:inline-block;background:#0C0C0D;color:#FFFFFF;text-decoration:none;font-weight:800;font-size:14px;padding:12px 18px;border-radius:999px">${esc(label)}</a>`;

/** Login / RSVP verification: six-digit code plus a magic link. */
export async function sendVerificationMail(to: string, code: string, purpose: "login" | "rsvp", next?: string) {
  const link = `${SITE}/giris/dogrula?e=${encodeURIComponent(to)}&kod=${code}${next ? `&next=${encodeURIComponent(next)}` : ""}`;
  const title = purpose === "rsvp" ? "Katılımını doğrula" : "partile’a giriş";
  const body = `<p style="margin:0 0 12px;font-size:18px;font-weight:800">${title}</p>
<p style="margin:0 0 16px;font-size:14px;line-height:1.5">Kodu gir ya da aşağıdaki linke dokun. Kod 10 dakika geçerli.</p>
<p style="margin:0 0 18px;font-size:32px;font-weight:800;letter-spacing:0.3em">${code}</p>
${button(link, purpose === "rsvp" ? "Katılımı tamamla" : "Giriş yap")}
<p style="margin:16px 0 0;font-size:12px;color:#5F584F">Bu isteği sen yapmadıysan bu e-postayı görmezden gel.</p>`;
  return send(to, `${code} · ${title}`, shell(body, "Şifre yok; kod tek seferlik. E-postan düzenleyenlere gösterilmez."), `${title}\n\nKodun: ${code}\n${link}\n\nKod 10 dakika geçerli.`);
}

/** Host announcement to guests (in-app notification is created separately). */
export async function sendBlastMail(to: string[], plan: { title: string; code: string; startsAt?: string; district?: string }, hostName: string, text: string) {
  if (!to.length) return { sent: false as const };
  const when = plan.startsAt ? `${formatDayShort(plan.startsAt)} · ${formatTime(plan.startsAt)}` : "Tarih netleşmedi";
  const url = planUrl(plan.code);
  const body = `<p style="margin:0 0 4px;font-size:13px;font-weight:800">${esc(plan.title)} · ${esc(hostName)}’dan duyuru</p>
<p style="margin:12px 0 16px;font-size:14px;line-height:1.5;white-space:pre-line">${esc(text)}</p>
${button(url, "Planı aç")}`;
  const footer = `${esc(when)}${plan.district ? ` · ${esc(plan.district)}` : ""} · Bu planın bildirimlerini sessize almak için plan sayfasındaki zili kullan.`;
  // One message per recipient so guests never see each other's addresses.
  const results = await Promise.all(to.map((addr) => send(addr, `${plan.title}: duyuru`, shell(body, footer), `${plan.title} · ${hostName}’dan duyuru\n\n${text}\n\n${url}`)));
  return { sent: results.some((r) => r.sent) };
}

/** Co-host invitation: the link signs the invitee in (magic code) and lands on the plan, where they accept. */
export async function sendCohostMail(to: string, code: string, plan: { title: string; code: string }, inviterName: string) {
  const link = `${SITE}/giris/dogrula?e=${encodeURIComponent(to)}&kod=${code}&next=${encodeURIComponent(`/e/${plan.code}`)}`;
  const body = `<p style="margin:0 0 12px;font-size:18px;font-weight:800">${esc(inviterName)} seni ortak düzenleyen yaptı</p>
<p style="margin:0 0 16px;font-size:14px;line-height:1.5"><strong>${esc(plan.title)}</strong> planını birlikte düzenlemek için davet edildin. Linke dokun, daveti kabul et; planı düzenleyebilir, katılımcıları görebilir, duyuru gönderebilirsin.</p>
${button(link, "Daveti aç")}
<p style="margin:16px 0 0;font-size:12px;color:#5F584F">Link 10 dakika geçerli; süresi dolarsa partile’a e-postanla giriş yapıp plana git.</p>`;
  return send(to, `${inviterName} seni ${plan.title} için ortak düzenleyen yaptı`, shell(body, "Ortak düzenleyenler planı değiştirebilir ve misafir listesini görür; e-posta adresleri görünmez."), `${inviterName} seni ${plan.title} için ortak düzenleyen olarak davet etti.\n\n${link}`);
}
