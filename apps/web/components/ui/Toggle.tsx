"use client";

/** Switch matching the settings artboards: teal when on, 48×28. */
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-pill transition-colors ${checked ? "bg-teal" : "bg-white/18"}`}
    >
      <span className={`absolute top-[3px] size-[22px] rounded-pill bg-white transition-[left] ${checked ? "left-[23px]" : "left-[3px]"}`} />
    </button>
  );
}

export function SettingRow({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-[60px] items-center justify-between gap-4 border-b border-line px-4.5 py-3 last:border-b-0">
      <span className="flex flex-col gap-0.5">
        <span className="text-[17px] font-bold">{title}</span>
        {hint && <span className="text-sm text-subtle">{hint}</span>}
      </span>
      {children}
    </div>
  );
}
