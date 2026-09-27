"use client";

import { useEffect, useRef } from "react";
import { CloseIcon } from "@/components/shell/icons";

/**
 * Dark modal shell used by the editor pickers and settings (matches the `Settings` artboard):
 * dimmed backdrop, panel `#121213`, 64px header with close, optional right slot.
 */
export function Modal({
  open,
  onClose,
  title,
  headerRight,
  width = 840,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  headerRight?: React.ReactNode;
  width?: number;
  children: React.ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("[data-autofocus], input, button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(6,3,2,0.6)] md:items-center md:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-modal border border-line bg-panel text-text shadow-[0_40px_100px_rgba(0,0,0,0.6)] md:max-h-[88dvh] md:rounded-modal"
        style={{ maxWidth: width }}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
          <button type="button" onClick={onClose} aria-label="Kapat" className="flex size-10 items-center justify-center rounded-pill hover:bg-white/8">
            <CloseIcon />
          </button>
          <h2 className="display text-lg tracking-normal">{title}</h2>
          <div className="flex min-w-10 justify-end">{headerRight}</div>
        </div>
        <div className="min-h-0 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export const modalFooter = "sticky bottom-0 z-10 flex justify-end gap-2.5 border-t border-line bg-panel px-6 py-4";
export const btnGhost = "flex h-12 items-center rounded-pill border border-white/25 px-5 text-[15px] font-bold";
export const btnPrimary = "flex h-12 items-center rounded-pill bg-white px-6 text-[15px] font-extrabold text-bg";
export const field = "h-12 w-full rounded-md border border-white/18 bg-white/6 px-4 text-base font-semibold text-text outline-none placeholder:text-subtle focus:border-white/40";
