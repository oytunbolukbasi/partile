/** Route map. Turkish slugs; see research/MVP_EKRAN_ENVANTERI.md for the screen each one maps to. */
export const routes = {
  landing: "/",
  login: "/giris",
  onboarding: "/ilk-giris",
  home: "/planlar",
  create: "/olustur",
  profile: "/profil",
  notifications: "/bildirimler",
  explore: "/kesfet",
  plan: (code: string) => `/e/${code}`,
  occasion: (slug: string) => `/${slug}`, // e.g. /dogum-gunu-davetiyesi
} as const;
