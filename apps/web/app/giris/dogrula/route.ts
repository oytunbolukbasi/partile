import { NextResponse } from "next/server";
import { VerificationCode } from "@partile/core";
import { consumeVerificationCode } from "@partile/db";
import { setSession } from "@/lib/auth";
import { routes } from "@/lib/routes";

/** Magic link from the verification e-mail: /giris/dogrula?e=…&kod=…&next=… */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("e") ?? "";
  const code = url.searchParams.get("kod") ?? "";
  const next = url.searchParams.get("next");
  const safeNext = next && next.startsWith("/") ? next : routes.home;
  if (!VerificationCode.safeParse(code).success) return NextResponse.redirect(new URL(`${routes.login}?hata=kod`, url.origin));
  const user = await consumeVerificationCode(email, code);
  if (!user) return NextResponse.redirect(new URL(`${routes.login}?hata=kod&next=${encodeURIComponent(safeNext)}`, url.origin));
  await setSession(user.id);
  return NextResponse.redirect(new URL(user.onboarded ? safeNext : `${routes.onboarding}?next=${encodeURIComponent(safeNext)}`, url.origin));
}
