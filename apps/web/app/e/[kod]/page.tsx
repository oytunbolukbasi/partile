import type { Metadata } from "next";
import { PlanCode, formatDayLong, formatTime } from "@partile/core";
import { notFound } from "next/navigation";
import { HostView } from "@/components/host/HostView";
import { PlanView } from "@/components/plan/PlanView";
import { getPlan, roleFor } from "@/lib/fixtures";

type Props = { params: Promise<{ kod: string }>; searchParams: Promise<{ goruntule?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kod } = await params;
  const plan = getPlan(kod);
  if (!plan) return { title: "Davetiye" };
  const when = plan.startsAt && !plan.dateTbd ? `${formatDayLong(plan.startsAt)} · ${formatTime(plan.startsAt)}` : "Tarih netleşmedi";
  return {
    title: plan.title,
    description: `${when} · ${plan.location?.district ?? ""} · Geliyor musun?`,
    openGraph: { title: plan.title, description: `${when} · Geliyor musun?`, type: "website" },
  };
}

/**
 * `/e/{kod}` — hosts get `EventHost`; guests get `InviteDesktop`/`InviteMobile` before RSVP and `Event`/`EventMobile` after.
 * `?goruntule=misafir` lets a host preview the guest view. Data from fixtures until the DB lands.
 */
export default async function PlanPage({ params, searchParams }: Props) {
  const [{ kod }, { goruntule }] = await Promise.all([params, searchParams]);
  if (!PlanCode.safeParse(kod).success) notFound();
  const plan = getPlan(kod);
  if (!plan) notFound();
  if (roleFor(plan) === "host" && goruntule !== "misafir") return <HostView plan={plan} />;
  return <PlanView plan={plan} />;
}
