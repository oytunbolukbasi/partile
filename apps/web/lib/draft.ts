"use client";

import { PlanDraft } from "@partile/core";
import { useCallback, useEffect, useRef, useState } from "react";

const KEY = "partile:draft:v1";

/** A fresh draft. Title is empty on purpose — the editor shows "Planın adı" as placeholder. */
export const emptyDraft = (): PlanDraft => PlanDraft.parse({ title: "Planın adı" });

/**
 * Draft lives in localStorage until the host verifies their e-mail on publish
 * (see inventory: "Giriş yapmadan oluşturma"). Persistence is debounced.
 */
export function useDraft() {
  const [draft, setDraft] = useState<PlanDraft>(emptyDraft);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
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
  }, []);

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
