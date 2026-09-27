import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  Fraunces,
  Hanken_Grotesk,
  Libre_Baskerville,
  Pinyon_Script,
  Schibsted_Grotesk,
  Space_Mono,
  Unbounded,
} from "next/font/google";
import "./globals.css";

const display = Schibsted_Grotesk({ subsets: ["latin", "latin-ext"], variable: "--font-display", weight: ["400", "700", "800", "900"] });
const body = Hanken_Grotesk({ subsets: ["latin", "latin-ext"], variable: "--font-body", weight: ["400", "500", "600", "700", "800"] });
const poster = Unbounded({ subsets: ["latin", "latin-ext"], variable: "--font-poster", weight: ["800"] });

/* Invitation title fonts (Klasik = display). Loaded lazily by the browser; no preload. */
const fraunces = Fraunces({ subsets: ["latin", "latin-ext"], variable: "--font-fraunces", weight: ["800"], style: ["normal", "italic"], preload: false });
const pinyon = Pinyon_Script({ subsets: ["latin", "latin-ext"], variable: "--font-pinyon", weight: "400", preload: false });
const baskerville = Libre_Baskerville({ subsets: ["latin", "latin-ext"], variable: "--font-baskerville", weight: ["700"], preload: false });
const mono = Space_Mono({ subsets: ["latin", "latin-ext"], variable: "--font-mono", weight: ["700"], preload: false });
const cormorant = Cormorant_Garamond({ subsets: ["latin", "latin-ext"], variable: "--font-cormorant", weight: ["400"], style: ["italic"], preload: false });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://getpartile.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "partile — Plan yap. Linki at. Kim geliyor gör.", template: "%s · partile" },
  description: "Dakikada davetiye hazırla, WhatsApp'ta paylaş, katılımları tek yerden takip et. Ücretsiz, uygulama gerekmez.",
  openGraph: { siteName: "partile", locale: "tr_TR", type: "website" },
};

export const viewport: Viewport = { themeColor: "#0C0C0D", colorScheme: "dark" };

const fontVars = [display, body, poster, fraunces, pinyon, baskerville, mono, cormorant].map((f) => f.variable).join(" ");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
