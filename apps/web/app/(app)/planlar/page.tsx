import { listCoAttendees, listMutedPlanIds, listPlansForUser } from "@partile/db";
import { HomeView } from "@/components/home/HomeView";
import { requireViewer } from "@/lib/auth";
import { routes } from "@/lib/routes";

export const metadata = { title: "Planların" };
export const dynamic = "force-dynamic";

/** Maps to `Home` / `HomeMobile` artboards. */
export default async function HomePage() {
  const viewer = await requireViewer(routes.home);
  const [plans, mutedIds, people] = await Promise.all([listPlansForUser(viewer.id), listMutedPlanIds(viewer.id), listCoAttendees(viewer.id)]);
  return <HomeView viewer={viewer} plans={plans} mutedIds={mutedIds} people={people} />;
}
