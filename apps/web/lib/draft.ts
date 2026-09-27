"use client";

import { PLACEHOLDER_TITLE, PlanDraft, isPlaceholderTitle } from "@partile/core";
import { useCallback, useEffect, useRef, useState } from "react";

const KEY = "partile:draft:v1";

/** Read the stored draft without touching it. `null` when there is none or it was never edited. */
export function loadDraft(): (PlanDraft & { touched: boolean }) | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = PlanDraft.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;
    const d = parsed.data;
    const touched = !isPlaceholderTitle(d.title) || !!d.startsAt || !!d.description || !!d.location;
    return { ...d, touched };
  } catch {
    return null;
  }
}

/** A fresh draft. The title is the placeholder sentinel; the editor shows it as an empty field and publishing refuses it. */
export const emptyDraft = (): PlanDraft => PlanDraft.parse({ title: PLACEHOLDER_TITLE });

/**
 * Draft lives in localStorage until the host verifies their e-mail on publish
 * (see inventory: "Giriş yapmadan oluşturma"). Persistence is debounced.
 */
export function useDraft(initial?: PlanDraft) {
  const [draft, setDraft] = useState<PlanDraft>(initial ?? emptyDraft);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (initial) return; // editing a published plan: nothing to load or persist locally
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = PlanDraft.safeParse(JSON.parse(raw));
        if (parsed.success) setDraft(parsed.data);
      }
    } catch {
      /* private mode or blocked storage: keep in-memory draft */
    }
    loaded.current = true;
  }, [initial]);

  useEffect(() => {
    if (!loaded.current) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(draft));
        setSavedAt(new Date());
      } catch {
        /* ignore */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [draft]);

  const patch = useCallback((p: Partial<PlanDraft>) => setDraft((d) => ({ ...d, ...p })), []);
  const reset = useCallback(() => {
    setDraft(emptyDraft());
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return { draft, patch, reset, savedAt };
}
