import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted (app/fonts, fetched by scripts/fetch-fonts.mjs): builds never depend on Google Fonts.
const display = localFont({
  variable: "--font-display",
  src: [
    { path: "./fonts/schibsted-grotesk-400.woff", weight: "400" },
    { path: "./fonts/schibsted-grotesk-700.woff", weight: "700" },
    { path: "./fonts/schibsted-grotesk-800.woff", weight: "800" },
    { path: "./fonts/schibsted-grotesk-900.woff", weight: "900" },
  ],
});
const body = localFont({
  variable: "--font-body",
  src: [
    { path: "./fonts/hanken-grotesk-400.woff", weight: "400" },
    { path: "./fonts/hanken-grotesk-500.woff", weight: "500" },
    { path: "./fonts/hanken-grotesk-600.woff", weight: "600" },
    { path: "./fonts/hanken-grotesk-700.woff", weight: "700" },
    { path: "./fonts/hanken-grotesk-800.woff", weight: "800" },
  ],
});
const poster = localFont({ variable: "--font-poster", src: [{ path: "./fonts/unbounded-800.woff", weight: "800" }] });
// Invitation title fonts: loaded on demand where a plan uses them.
const fraunces = localFont({ variable: "--font-fraunces", preload: false, src: [{ path: "./fonts/fraunces-800.woff", weight: "800", style: "normal" }, { path: "./fonts/fraunces-800-italic.woff", weight: "800", style: "italic" }] });
const pinyon = localFont({ variable: "--font-pinyon", preload: false, src: [{ path: "./fonts/pinyon-script-400.woff", weight: "400" }] });
const baskerville = localFont({ variable: "--font-baskerville", preload: false, src: [{ path: "./fonts/libre-baskerville-700.woff", weight: "700" }] });
const mono = localFont({ variable: "--font-mono", preload: false, src: [{ path: "./fonts/space-mono-700.woff", weight: "700" }] });
const cormorant = localFont({ variable: "--font-cormorant", preload: false, src: [{ path: "./fonts/cormorant-garamond-400-italic.woff", weight: "400", style: "italic" }] });

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
