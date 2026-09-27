export const metadata = { title: "Ana sayfa" };

/** Maps to `Home` / `HomeMobile` artboards. Placeholder until data layer lands. */
export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] aura-top" aria-hidden />
      <div className="relative px-4 pt-20 md:px-14 md:pt-28">
        <h1 className="display text-[38px] md:text-[64px]">Hoş geldin!</h1>
        <p className="mt-2 text-xl text-muted">Planların burada listelenecek.</p>
      </div>
    </main>
  );
}
