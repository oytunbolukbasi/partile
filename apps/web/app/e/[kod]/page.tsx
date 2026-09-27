import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { PlanCode, formatDayLong, formatTime } from "@partile/core";
import { bumpViews, getPlanByCode, getViewerGuest, pendingCohostInvite, roleFor, viewerPlanState } from "@partile/db";
import { HostView } from "@/components/host/HostView";
import { PlanView } from "@/components/plan/PlanView";
import { getViewer } from "@/lib/auth";
import { routes } from "@/lib/routes";

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
  const [{ kod }, query] = await Promise.all([params, searchParams]);
  const { goruntule } = query;
  if (!PlanCode.safeParse(kod).success) notFound();
  const plan = await getPlanByCode(kod);
  if (!plan) notFound();
  // Renamed plan: old links (already on WhatsApp) move to the current code.
  if (plan.code !== kod) {
    const qs = new URLSearchParams(Object.entries(query).filter((e): e is [string, string] => typeof e[1] === "string")).toString();
    permanentRedirect(`${routes.plan(plan.code)}${qs ? `?${qs}` : ""}`);
  }
  const viewer = await getViewer();
  const role = await roleFor(plan.id, viewer?.id ?? null);
  if (role === "host" && goruntule !== "misafir") return <HostView plan={plan} viewerId={viewer!.id} />;
  const hostIds = plan.hosts.filter((h) => h.accepted !== false).map((h) => h.id);
  const [viewerGuest, cohostInvite, state] = await Promise.all([getViewerGuest(plan.id, viewer?.id ?? null), pendingCohostInvite(plan.id, viewer?.id ?? null), viewerPlanState(plan.id, viewer?.id ?? null, hostIds)]);
  if (role !== "host") await bumpViews(plan.id);
  return <PlanView plan={plan} viewer={viewer} viewerGuest={viewerGuest} cohostInvite={cohostInvite} state={state} />;
}
