/**
 * Legal page facts in one place. DRAFT — to be reviewed by a lawyer before launch.
 * `controller` / `address` must be the registered data controller (şahıs ya da şirket unvanı + adres).
 */
export const LEGAL = {
  controller: "partile",
  address: "",
  email: "merhaba@getpartile.com",
  site: "getpartile.com",
  updated: "27 Eylül 2026",
  /** Service providers that process data on our behalf (KVKK md. 8–9). */
  processors: [
    { name: "Railway", role: "Uygulama sunucusu ve dosya depolama", where: "ABD / AB" },
    { name: "Neon", role: "Veritabanı", where: "ABD" },
    { name: "Resend", role: "E-posta gönderimi", where: "ABD / Japonya" },
    { name: "Cloudflare", role: "DNS, güvenlik ve içerik dağıtımı", where: "Küresel" },
    { name: "Photon (komoot) / OpenStreetMap", role: "Adres önerisi (yalnız yazılan arama metni)", where: "AB" },
  ],
} as const;
