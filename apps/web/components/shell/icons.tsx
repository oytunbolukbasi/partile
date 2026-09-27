import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size: number, props: P) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...props,
});

export const HomeIcon = ({ size = 24, ...p }: P) => (
  <svg {...base(size, p)}><path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" /></svg>
);
export const ExploreIcon = ({ size = 24, ...p }: P) => (
  <svg {...base(size, p)}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></svg>
);
export const CreateIcon = ({ size = 24, ...p }: P) => (
  <svg {...base(size, p)}><rect x="3" y="3" width="18" height="18" rx="5" /><path d="M12 8v8M8 12h8" /></svg>
);
export const CardIcon = ({ size = 24, ...p }: P) => (
  <svg {...base(size, p)}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 8l9 6 9-6" /></svg>
);
export const MessagesIcon = ({ size = 24, ...p }: P) => (
  <svg {...base(size, p)}><path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-4.6A8 8 0 1 1 21 12z" /></svg>
);
export const BellIcon = ({ size = 24, ...p }: P) => (
  <svg {...base(size, p)}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" /></svg>
);
export const PlusIcon = ({ size = 18, ...p }: P) => (
  <svg {...base(size, { strokeWidth: 2.4, ...p })}><path d="M12 5v14M5 12h14" /></svg>
);
export const MenuIcon = ({ size = 26, ...p }: P) => (
  <svg {...base(size, { strokeWidth: 2, ...p })}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const CheckIcon = ({ size = 24, ...p }: P) => (
  <svg {...base(size, { strokeWidth: 2.6, ...p })}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
export const ArrowRightIcon = ({ size = 20, ...p }: P) => (
  <svg {...base(size, { strokeWidth: 2.6, ...p })}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const ChevronDownIcon = ({ size = 16, ...p }: P) => (
  <svg {...base(size, { strokeWidth: 2, ...p })}><path d="M6 9l6 6 6-6" /></svg>
);
export const CrownIcon = ({ size = 20, ...p }: P) => (
  <svg {...base(size, p)}><path d="M3 18l2-10 5 5 2-7 2 7 5-5 2 10z" /></svg>
);
export const CrownFilledIcon = ({ size = 12, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}><path d="M3 18l2-10 5 5 2-7 2 7 5-5 2 10z" /></svg>
);
export const PinIcon = ({ size = 20, ...p }: P) => (
  <svg {...base(size, p)}><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
);
export const UsersIcon = ({ size = 20, ...p }: P) => (
  <svg {...base(size, p)}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.6.8 2.6 2.6 3 5.2" /></svg>
);
export const TagIcon = ({ size = 20, ...p }: P) => (
  <svg {...base(size, p)}><path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9z" /><circle cx="8" cy="8" r="1.5" /></svg>
);
export const CalendarIcon = ({ size = 22, ...p }: P) => (
  <svg {...base(size, p)}><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
);
export const LockIcon = ({ size = 20, ...p }: P) => (
  <svg {...base(size, p)}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
);
export const PencilIcon = ({ size = 16, ...p }: P) => (
  <svg {...base(size, { strokeWidth: 2.2, ...p })}><path d="M4 20l4-1L19 8l-3-3L5 16z" /></svg>
);
export const SparklesIcon = ({ size = 20, ...p }: P) => (
  <svg {...base(size, p)}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /></svg>
);
export const EyeIcon = ({ size = 30, ...p }: P) => (
  <svg {...base(size, p)}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const SettingsIcon = ({ size = 30, ...p }: P) => (
  <svg {...base(size, p)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
);
export const DiceIcon = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}><rect x="3" y="3" width="18" height="18" rx="4" /><circle cx="8.5" cy="8.5" r="1" /><circle cx="15.5" cy="15.5" r="1" /><circle cx="15.5" cy="8.5" r="1" /><circle cx="8.5" cy="15.5" r="1" /></svg>
);
export const CloseIcon = ({ size = 22, ...p }: P) => (
  <svg {...base(size, { strokeWidth: 2.2, ...p })}><path d="M7 7l10 10M17 7L7 17" /></svg>
);
