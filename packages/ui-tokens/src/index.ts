/**
 * partile design tokens — single source of truth for web and (later) mobile.
 * Values mirror CLAUDE.md "Tasarım dili" and the `Main` artboard on the canvas.
 * `tokens.css` exposes the same values as CSS custom properties.
 */

/** App shell ("Gece"). Dark only — there is no light mode. */
export const shell = {
  bg: "#0C0C0D",
  panel: "#121213",
  panelRaised: "#161618",
  text: "#F5F2EC",
  textMuted: "#CFC9C0",
  textSubtle: "#A8A39B",
  white: "#FFFFFF",
  /** Aura trio, also used for accents. Purple is banned. */
  coral: "#FF6A3D",
  amber: "#FFB020",
  amberSoft: "#FFB547",
  teal: "#1EC9B0",
  /** Destructive (cancel / delete) only. */
  danger: "#FF8C6B",
  whatsapp: "#25D366",
} as const;

/** Glass surfaces drawn over an aura or an invitation theme. */
export const glass = {
  fillDark: "rgba(255,255,255,0.08)",
  fillDarkStrong: "rgba(255,255,255,0.14)",
  lineDark: "rgba(255,255,255,0.16)",
  fillLight: "rgba(0,0,0,0.06)",
  lineLight: "rgba(0,0,0,0.12)",
  /** Dropdown / context menus. */
  menuFill: "rgba(28,28,31,0.72)",
  menuLine: "rgba(255,255,255,0.16)",
  menuBlur: "24px",
} as const;

/** Background aura used on Home, Landing, Login. */
export const aura =
  "radial-gradient(42% 60% at 18% 0%, rgba(255,106,61,0.55) 0%, rgba(255,106,61,0) 70%), " +
  "radial-gradient(38% 55% at 55% 0%, rgba(255,176,32,0.45) 0%, rgba(255,176,32,0) 70%), " +
  "radial-gradient(40% 60% at 92% 0%, rgba(30,201,176,0.4) 0%, rgba(30,201,176,0) 70%)";

export type InvitationTheme = {
  id: string;
  name: string;
  /** Full-page background (CSS `background` value). */
  bg: string;
  /** Poster background when no image is set. */
  poster: string;
  fg: string;
  accent: string;
  /** Glow colour behind poster numerals. */
  glow: string;
  /** Light themes use dark glass; dark themes use light glass. */
  tone: "dark" | "light";
  premium?: boolean;
};

const radial = (c: string, pos: string, size: string) =>
  `radial-gradient(${size} at ${pos}, ${c} 0%, ${c}00 70%)`;

/** The eight launch themes. Order = order in the theme panel. */
export const invitationThemes: InvitationTheme[] = [
  {
    id: "kor",
    name: "Kor",
    fg: "#FFF1E3",
    accent: "#FFB547",
    glow: "rgba(255,177,71,0.7)",
    tone: "dark",
    bg: `${radial("#C2410C", "18% 8%", "48% 42%")}, ${radial("#F59E0B", "82% 22%", "40% 36%")}, ${radial("#3F0D06", "50% 105%", "70% 55%")}, #160804`,
    poster: `${radial("#C2410C", "25% 20%", "70% 60%")}, ${radial("#F59E0B", "85% 35%", "60% 55%")}, #160804`,
  },
  {
    id: "derin-deniz",
    name: "Derin deniz",
    fg: "#EAFBF8",
    accent: "#FFD166",
    glow: "rgba(31,182,166,0.7)",
    tone: "dark",
    bg: `${radial("#0E7C86", "15% 10%", "48% 42%")}, ${radial("#1FB6A6", "85% 25%", "40% 36%")}, #04151C`,
    poster: `${radial("#0E7C86", "20% 15%", "70% 60%")}, ${radial("#1FB6A6", "85% 35%", "55% 50%")}, #04151C`,
  },
  {
    id: "limonata",
    name: "Limonata",
    fg: "#1B1A14",
    accent: "#E4572E",
    glow: "rgba(228,87,46,0.35)",
    tone: "light",
    bg: `${radial("#FFF0A8", "20% 0%", "50% 45%")}, ${radial("#D9F99D", "90% 20%", "45% 40%")}, #FBF7E4`,
    poster: `${radial("#FFE066", "25% 20%", "70% 60%")}, ${radial("#BEF264", "85% 40%", "60% 55%")}, #F7F1C9`,
  },
  {
    id: "gece",
    name: "Gece",
    fg: "#F5F2EC",
    accent: "#FF6A3D",
    glow: "rgba(255,106,61,0.6)",
    tone: "dark",
    bg: `${radial("#2A2A2E", "30% 0%", "50% 40%")}, #0B0B0C`,
    poster: `${radial("#2E2E33", "30% 25%", "60% 55%")}, #0B0B0C`,
  },
  {
    id: "zeytinlik",
    name: "Zeytinlik",
    fg: "#F3F1E4",
    accent: "#F2C14E",
    glow: "rgba(168,181,69,0.6)",
    tone: "dark",
    premium: true,
    bg: `${radial("#4B5D2A", "20% 10%", "48% 42%")}, ${radial("#A8B545", "85% 28%", "40% 36%")}, #1C2412`,
    poster: `${radial("#4B5D2A", "25% 20%", "70% 60%")}, ${radial("#A8B545", "85% 40%", "60% 55%")}, #1C2412`,
  },
  {
    id: "pudra",
    name: "Pudra",
    fg: "#3A1D16",
    accent: "#C2410C",
    glow: "rgba(194,65,12,0.3)",
    tone: "light",
    bg: `${radial("#FFD9C9", "20% 0%", "50% 45%")}, ${radial("#FFC2B4", "90% 25%", "45% 40%")}, #FBE8DE`,
    poster: `${radial("#FFC2B4", "25% 20%", "70% 60%")}, ${radial("#FFD9C9", "85% 40%", "60% 55%")}, #F6D6C8`,
  },
  {
    id: "kobalt",
    name: "Kobalt",
    fg: "#EAF2FF",
    accent: "#FDE047",
    glow: "rgba(56,189,248,0.6)",
    tone: "dark",
    premium: true,
    bg: `${radial("#1D4ED8", "20% 10%", "48% 42%")}, ${radial("#38BDF8", "85% 28%", "40% 36%")}, #071233`,
    poster: `${radial("#1D4ED8", "25% 20%", "70% 60%")}, ${radial("#38BDF8", "85% 40%", "60% 55%")}, #071233`,
  },
  {
    id: "kiraz",
    name: "Kiraz",
    fg: "#FFF0F3",
    accent: "#FFD166",
    glow: "rgba(251,113,133,0.6)",
    tone: "dark",
    premium: true,
    bg: `${radial("#B91C3C", "20% 10%", "48% 42%")}, ${radial("#FB7185", "85% 28%", "40% 36%")}, #2A0710`,
    poster: `${radial("#B91C3C", "25% 20%", "70% 60%")}, ${radial("#FB7185", "85% 40%", "60% 55%")}, #2A0710`,
  },
];

export const themeById = (id: string): InvitationTheme =>
  invitationThemes.find((t) => t.id === id) ?? invitationThemes[0]!;

/** Title fonts guests can pick for an invitation. All have Turkish glyphs. */
export const titleFonts = [
  { id: "klasik", name: "Klasik", family: "'Schibsted Grotesk', sans-serif", weight: 800 },
  { id: "eklektik", name: "Eklektik", family: "'Fraunces', serif", weight: 800 },
  { id: "sik", name: "Şık", family: "'Pinyon Script', cursive", weight: 400 },
  { id: "edebi", name: "Edebi", family: "'Libre Baskerville', serif", weight: 700 },
  { id: "dijital", name: "Dijital", family: "'Space Mono', monospace", weight: 700 },
  { id: "zarif", name: "Zarif", family: "'Cormorant Garamond', serif", weight: 400, italic: true },
] as const;
export type TitleFontId = (typeof titleFonts)[number]["id"];

export const fonts = {
  display: "'Schibsted Grotesk', sans-serif",
  body: "'Hanken Grotesk', sans-serif",
  poster: "'Unbounded', sans-serif",
  mono: "'Space Mono', monospace",
} as const;

export const radius = { sm: 10, md: 12, lg: 14, xl: 16, xxl: 20, modal: 24, pill: 999 } as const;
export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 40 } as const;
/** Minimum touch target in px. */
export const touchTarget = 44;
export const layout = { desktop: 1440, mobile: 390, rail: 72, poster: 346 } as const;
