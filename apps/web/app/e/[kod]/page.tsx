import type { Metadata } from "next";
import { PlanCode } from "@partile/core";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ kod: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kod } = await params;
  return { title: `Davetiye · ${kod}`, openGraph: { title: "Geliyor musun?" } };
}

/** Maps to `InviteDesktop` / `InviteMobile` (pre-RSVP) and `Event` / `EventMobile` (post-RSVP). */
export default async function PlanPage({ params }: Props) {
  const { kod } = await params;
  if (!PlanCode.safeParse(kod).success) notFound();
  return (
    <main className="px-4 pt-20 md:px-14 md:pt-28">
      <h1 className="display text-[48px]">Davetiye</h1>
      <p className="mt-2 text-xl text-muted">
        Plan kodu: <code className="font-mono">{kod}</code>
      </p>
    </main>
  );
}
