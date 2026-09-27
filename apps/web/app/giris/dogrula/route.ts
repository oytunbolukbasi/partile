import { NextResponse } from "next/server";
import { VerificationCode } from "@partile/core";
import { consumeVerificationCode } from "@partile/db";
import { setSession } from "@/lib/auth";
import { routes } from "@/lib/routes";

/**
 * Public origin for redirects. Behind Railway/Cloudflare the request URL is the container's own
 * (http://0.0.0.0:3000), so use the forwarded host, falling back to NEXT_PUBLIC_SITE_URL.
 */
function publicOrigin(req: Request): string {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  if (host && !/^(0\.0\.0\.0|127\.0\.0\.1|localhost)(:\d+)?$/.test(host)) return `${proto.split(",")[0]}://${host.split(",")[0]}`;
  return process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
}

/** Magic link from the verification e-mail: /giris/dogrula?e=…&kod=…&next=… */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = publicOrigin(req);
  const email = url.searchParams.get("e") ?? "";
  const code = url.searchParams.get("kod") ?? "";
  const next = url.searchParams.get("next");
  const safeNext = next && next.startsWith("/") ? next : routes.home;
  if (!VerificationCode.safeParse(code).success) return NextResponse.redirect(new URL(`${routes.login}?hata=kod`, origin));
  const user = await consumeVerificationCode(email, code);
  if (!user) return NextResponse.redirect(new URL(`${routes.login}?hata=kod&next=${encodeURIComponent(safeNext)}`, origin));
  await setSession(user.id);
  return NextResponse.redirect(new URL(user.onboarded ? safeNext : `${routes.onboarding}?next=${encodeURIComponent(safeNext)}`, origin));
}
