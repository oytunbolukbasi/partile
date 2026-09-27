import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Schibsted_Grotesk, Unbounded } from "next/font/google";
import "./globals.css";

const display = Schibsted_Grotesk({ subsets: ["latin", "latin-ext"], variable: "--font-display", weight: ["400", "700", "800", "900"] });
const body = Hanken_Grotesk({ subsets: ["latin", "latin-ext"], variable: "--font-body", weight: ["400", "500", "600", "700", "800"] });
const poster = Unbounded({ subsets: ["latin", "latin-ext"], variable: "--font-poster", weight: ["800"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://getpartile.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "partile — Plan yap. Linki at. Kim geliyor gör.", template: "%s · partile" },
  description: "Dakikada davetiye hazırla, WhatsApp'ta paylaş, katılımları tek yerden takip et. Ücretsiz, uygulama gerekmez.",
  openGraph: { siteName: "partile", locale: "tr_TR", type: "website" },
};

export const viewport: Viewport = { themeColor: "#0C0C0D", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${display.variable} ${body.variable} ${poster.variable}`}>
      <body>{children}</body>
    </html>
  );
}
