import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlanCode, formatDayLong, formatTime } from "@partile/core";
import { bumpViews, getPlanByCode, getViewerGuest, pendingCohostInvite, roleFor } from "@partile/db";
import { HostView } from "@/components/host/HostView";
import { PlanView } from "@/components/plan/PlanView";
import { getViewer } from "@/lib/auth";

type Props = { params: Promise<{ kod: string }>; searchParams: Promise<{ goruntule?: string; paylas?: string }> };
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kod } = await params;
  const plan = PlanCode.safeParse(kod).success ? await getPlanByCode(kod) : null;
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
 * `?goruntule=misafir` lets a host preview the guest view; `?paylas=1` opens the share step.
 */
export default async function PlanPage({ params, searchParams }: Props) {
  const [{ kod }, { goruntule }] = await Promise.all([params, searchParams]);
  if (!PlanCode.safeParse(kod).success) notFound();
  const plan = await getPlanByCode(kod);
  if (!plan) notFound();
  const viewer = await getViewer();
  const role = await roleFor(plan.id, viewer?.id ?? null);
  if (role === "host" && goruntule !== "misafir") return <HostView plan={plan} viewerId={viewer!.id} />;
  const [viewerGuest, cohostInvite] = await Promise.all([getViewerGuest(plan.id, viewer?.id ?? null), pendingCohostInvite(plan.id, viewer?.id ?? null)]);
  if (role !== "host") await bumpViews(plan.id);
  return <PlanView plan={plan} viewer={viewer} viewerGuest={viewerGuest} cohostInvite={cohostInvite} />;
}
