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
