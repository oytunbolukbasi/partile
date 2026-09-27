"use client";

import { initials as toInitials } from "@partile/core";
import { useCallback, useEffect, useState } from "react";

const KEY = "partile:session:v1";

/** Signed-in viewer, kept in the browser until real auth (Resend codes) lands. */
export type Session = { email: string; name: string; bio?: string; birthday?: string; notifications: boolean; onboarded: boolean };

export const readSession = (): Session | null => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
};

const write = (s: Session | null) => {
  try {
    if (s) localStorage.setItem(KEY, JSON.stringify(s));
    else localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
};

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setSession(readSession());
    setReady(true);
  }, []);

  const signIn = useCallback((email: string) => {
    const prev = readSession();
    const next: Session = prev?.email === email ? prev : { email, name: "", notifications: true, onboarded: false };
    write(next);
    setSession(next);
    return next;
  }, []);
  const update = useCallback((p: Partial<Session>) => {
    setSession((s) => {
      if (!s) return s;
      const next = { ...s, ...p };
      write(next);
      return next;
    });
  }, []);
  const signOut = useCallback(() => {
    write(null);
    setSession(null);
  }, []);

  return { session, ready, signIn, update, signOut, initials: session?.name ? toInitials(session.name) : "OB" };
}

/** `o•••n@gmail.com` — what the code step shows. */
export const maskEmail = (email: string) => {
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  return `${user[0]}•••${user.length > 1 ? user[user.length - 1] : ""}@${domain}`;
};
