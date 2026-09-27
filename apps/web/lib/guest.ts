"use client";

import type { Rsvp } from "@partile/core";
import { useCallback, useEffect, useState } from "react";

/** The guest's own RSVP for a plan, kept in the browser until accounts land. */
export function useGuestRsvp(code: string) {
  const key = `partile:rsvp:${code}`;
  const [rsvp, setRsvp] = useState<Rsvp | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setRsvp(JSON.parse(raw) as Rsvp);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, [key]);

  const save = useCallback(
    (r: Rsvp | null) => {
      setRsvp(r);
      try {
        if (r) localStorage.setItem(key, JSON.stringify(r));
        else localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    },
    [key],
  );

  return { rsvp, save, ready };
}

export type Vote = "yes" | "maybe" | "no";

/** The guest's date-poll votes for a plan (option id → vote), kept in the browser until accounts land. */
export function useGuestPoll(code: string) {
  const key = `partile:poll:${code}`;
  const [votes, setVotes] = useState<Record<string, Vote> | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setVotes(JSON.parse(raw) as Record<string, Vote>);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, [key]);

  const save = useCallback(
    (v: Record<string, Vote>) => {
      setVotes(v);
      try {
        localStorage.setItem(key, JSON.stringify(v));
      } catch {
        /* ignore */
      }
    },
    [key],
  );

  return { votes, save, ready };
}
