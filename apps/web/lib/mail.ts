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

const DOMAIN = SITE.replace(/^https?:\/\//, "");
const LOGO = `${SITE}/api/marka`;

/**
 * Brand shell for every mail: dark header with the mark + wordmark, light card body, domain footer.
 * Tables and inline styles only (Gmail/Outlook ignore most CSS); logo is a PNG because mail clients drop SVG.
 * `preheader` is the grey preview line inboxes show next to the subject.
 */
function shell(body: string, footer: string, preheader = "") {
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>partile</title></head>
<body style="margin:0;padding:0;background:#F5F2EC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0C0C0D">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#F5F2EC">${esc(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F5F2EC"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#FFFFFF;border-radius:18px;overflow:hidden;border:1px solid #E2D7C5">
<tr><td style="background:#0C0C0D;padding:18px 24px">
<a href="${SITE}" style="text-decoration:none;color:#F5F2EC">
<table role="presentation" cellspacing="0" cellpadding="0"><tr>
<td style="vertical-align:middle"><img src="${LOGO}" width="36" height="36" alt="partile" style="display:block;border:0;border-radius:11px"></td>
<td style="vertical-align:middle;padding-left:10px;font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#F5F2EC">partile</td>
</tr></table></a>
</td></tr>
<tr><td style="padding:28px 24px 24px">${body}</td></tr>
<tr><td style="padding:16px 24px;border-top:1px solid #EFE7DA;font-size:12px;line-height:1.5;color:#5F584F">${footer}<br><a href="${SITE}" style="color:#0C0C0D;font-weight:700;text-decoration:none">${esc(DOMAIN)}</a> · Plan yap, linki at, kim geliyor gör.</td></tr>
</table>
</td></tr></table></body></html>`;
}
const button = (href: string, label: string) => `<a href="${href}" style="display:inline-block;background:#0C0C0D;color:#FFFFFF;text-decoration:none;font-weight:800;font-size:15px;padding:14px 24px;border-radius:999px">${esc(label)}</a>`;

/** Login / RSVP verification: six-digit code plus a magic link. */
export async function sendVerificationMail(to: string, code: string, purpose: "login" | "rsvp", next?: string) {
  const m = verificationMail(to, code, purpose, next);
  return send(to, m.subject, m.html, m.text);
}

/** Rendered verification mail (also used by the development preview at /api/eposta-onizleme). */
export function verificationMail(to: string, code: string, purpose: "login" | "rsvp", next?: string) {
  const link = `${SITE}/giris/dogrula?e=${encodeURIComponent(to)}&kod=${code}${next ? `&next=${encodeURIComponent(next)}` : ""}`;
  const title = purpose === "rsvp" ? "Katılımını doğrula" : "partile’a giriş";
  const lead = purpose === "rsvp" ? "Katılımını tamamlamak için kodu gir ya da düğmeye dokun." : "Giriş yapmak için kodu gir ya da düğmeye dokun.";
  const body = `<p style="margin:0 0 6px;font-size:22px;font-weight:800;letter-spacing:-0.4px">${title}</p>
<p style="margin:0 0 20px;font-size:15px;line-height:1.5;color:#3D3832">${lead} Kod 10 dakika geçerli.</p>
<table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 22px"><tr><td style="background:#F5F2EC;border:1px solid #E2D7C5;border-radius:14px;padding:14px 22px;font-size:34px;font-weight:800;letter-spacing:10px;font-family:'SF Mono',Menlo,Consolas,monospace;color:#0C0C0D">${code}</td></tr></table>
${button(link, purpose === "rsvp" ? "Katılımı tamamla" : "Giriş yap")}
<p style="margin:22px 0 0;font-size:12px;line-height:1.5;color:#5F584F">Düğme çalışmazsa bu linki tarayıcına yapıştır:<br><a href="${link}" style="color:#5F584F;word-break:break-all">${esc(link)}</a></p>
<p style="margin:14px 0 0;font-size:12px;color:#5F584F">Bu isteği sen yapmadıysan e-postayı görmezden gelebilirsin; hesabında bir değişiklik olmaz.</p>`;
  return { subject: `${code} · ${title}`, html: shell(body, "Şifre yok; kod tek seferlik. E-postan düzenleyenlere gösterilmez.", `Kodun: ${code} · 10 dakika geçerli`), text: `${title}\n\nKodun: ${code}\n${link}\n\nKod 10 dakika geçerli.\n\n${DOMAIN}` };
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

/** Host-added invitee: "X seni davet etti — geliyor musun?" with a magic link straight to the invitation. */
export async function sendInviteMail(to: string, code: string, plan: { title: string; code: string; startsAt?: string; district?: string }, hostName: string) {
  const link = `${SITE}/giris/dogrula?e=${encodeURIComponent(to)}&kod=${code}&next=${encodeURIComponent(`/e/${plan.code}`)}`;
  const when = plan.startsAt ? `${formatDayShort(plan.startsAt)} · ${formatTime(plan.startsAt)}` : "Tarih netleşmedi";
  const body = `<p style="margin:0 0 6px;font-size:13px;color:#5F584F">${esc(hostName)} seni davet etti</p>
<p style="margin:0 0 12px;font-size:20px;font-weight:800">${esc(plan.title)}</p>
<p style="margin:0 0 16px;font-size:14px;line-height:1.5">${esc(when)}${plan.district ? ` · ${esc(plan.district)}` : ""}<br>Geliyor musun? Linke dokun, tek adımda cevapla.</p>
${button(link, "Davetiyeyi aç")}
<p style="margin:16px 0 0;font-size:12px;color:#5F584F">Link 10 dakika geçerli; sonra ${esc(SITE.replace("https://", ""))}/e/${esc(plan.code)} adresinden e-postanla giriş yapabilirsin.</p>`;
  return send(to, `${hostName} seni davet etti: ${plan.title}`, shell(body, "E-postan yalnızca giriş ve hatırlatma için kullanılır; düzenleyenlere gösterilmez."), `${hostName} seni davet etti: ${plan.title}\n${when}\n\n${link}`);
}

/** Scheduled reminders: "Katılımını bildir" a week before, "2 saat kaldı" before the plan. */
export async function sendReminderMail(to: string, kind: "rsvp" | "event", plan: { title: string; code: string; startsAt?: string; district?: string; address?: string }) {
  const url = planUrl(plan.code);
  const when = plan.startsAt ? `${formatDayShort(plan.startsAt)} · ${formatTime(plan.startsAt)}` : "";
  const title = kind === "rsvp" ? `${plan.title} — geliyor musun?` : `${plan.title} 2 saat sonra başlıyor`;
  const body = kind === "rsvp"
    ? `<p style="margin:0 0 12px;font-size:18px;font-weight:800">${esc(plan.title)}</p><p style="margin:0 0 16px;font-size:14px;line-height:1.5">${esc(when)}${plan.district ? ` · ${esc(plan.district)}` : ""}<br>Bir hafta kaldı, düzenleyen kimlerin geleceğini bilmek istiyor. Katılımını bildir.</p>${button(url, "Katılımını bildir")}`
    : `<p style="margin:0 0 12px;font-size:18px;font-weight:800">2 saat kaldı: ${esc(plan.title)}</p><p style="margin:0 0 16px;font-size:14px;line-height:1.5">${esc(when)}${plan.address ? `<br>${esc(plan.address)}` : ""}</p>${button(url, "Planı aç")}`;
  return send(to, title, shell(body, "Bu hatırlatma, katılım bildirdiğin ya da davet edildiğin plan için gönderildi. Planı sessize almak için plan sayfasındaki zili kullan."), `${title}\n${when}\n\n${url}`);
}

/** Plan cancelled: one message per guest so addresses stay private. */
export async function sendCancelMail(to: string[], plan: { title: string; code: string; startsAt?: string }, hostName: string, note?: string) {
  if (!to.length) return { sent: false as const };
  const when = plan.startsAt ? `${formatDayShort(plan.startsAt)} · ${formatTime(plan.startsAt)}` : "";
  const body = `<p style="margin:0 0 6px;font-size:22px;font-weight:800;letter-spacing:-0.4px">${esc(plan.title)} iptal edildi</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.5;color:#3D3832">${esc(hostName)} bu planı iptal etti${when ? ` (${esc(when)})` : ""}. Takvimine eklediysen kaldırabilirsin.</p>
${note?.trim() ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 18px;width:100%"><tr><td style="background:#F5F2EC;border-radius:12px;padding:12px 14px;font-size:14px;line-height:1.5;white-space:pre-line">${esc(note.trim())}</td></tr></table>` : ""}
${button(planUrl(plan.code), "Plan sayfasını aç")}`;
  const results = await Promise.all(to.map((addr) => send(addr, `İptal: ${plan.title}`, shell(body, "Bu e-posta, katıldığın ya da davet edildiğin plan iptal edildiği için gönderildi.", `${hostName} planı iptal etti`), `${plan.title} iptal edildi.\n${note ?? ""}\n\n${planUrl(plan.code)}`)));
  return { sent: results.some((r) => r.sent) };
}
