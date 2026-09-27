import type { Metadata } from "next";
import { PlanCode, formatDayLong, formatTime } from "@partile/core";
import { notFound } from "next/navigation";
import { PlanView } from "@/components/plan/PlanView";
import { getPlan } from "@/lib/fixtures";

type Props = { params: Promise<{ kod: string }> };

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

/** `/e/{kod}` — `InviteDesktop` / `InviteMobile` before RSVP, `Event` / `EventMobile` after. Data from fixtures until the DB lands. */
export default async function PlanPage({ params }: Props) {
  const { kod } = await params;
  if (!PlanCode.safeParse(kod).success) notFound();
  const plan = getPlan(kod);
  if (!plan) notFound();
  return <PlanView plan={plan} />;
}
