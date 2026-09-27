import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { initials } from "@partile/core";
import { getUser } from "@partile/db";
import { routes } from "./routes";

const COOKIE = "partile_session";
const MAX_AGE = 60 * 60 * 24 * 90; // 90 days
const secret = () => process.env.AUTH_SECRET || "partile-dev-secret-change-me";

const sign = (userId: string) => `${userId}.${createHmac("sha256", secret()).update(userId).digest("base64url")}`;
const verify = (token: string | undefined): string | null => {
  if (!token) return null;
  const i = token.lastIndexOf(".");
  if (i < 1) return null;
  const userId = token.slice(0, i);
  const expected = sign(userId);
  if (expected.length !== token.length) return null;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(token)) ? userId : null;
};

/** What client components get to know about the signed-in user. Never includes other people's e-mails. */
export type Viewer = { id: string; email: string; name: string; initials: string; bio?: string; birthday?: string; notifications: boolean; onboarded: boolean };

export async function getViewer(): Promise<Viewer | null> {
  const jar = await cookies();
  const userId = verify(jar.get(COOKIE)?.value);
  if (!userId) return null;
  const u = await getUser(userId);
  if (!u) return null;
  return { id: u.id, email: u.email, name: u.name, initials: u.name ? initials(u.name) : "?", bio: u.bio ?? undefined, birthday: u.birthday ?? undefined, notifications: u.notifications, onboarded: u.onboarded };
}

/** Redirects to login (returning here afterwards) when signed out. */
export async function requireViewer(next: string): Promise<Viewer> {
  const v = await getViewer();
  if (!v) redirect(`${routes.login}?next=${encodeURIComponent(next)}`);
  return v;
}

export async function setSession(userId: string) {
  const jar = await cookies();
  jar.set(COOKIE, sign(userId), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: MAX_AGE });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
