import { listPublicPlans } from "@partile/db";
import { ExploreView } from "@/components/explore/ExploreView";
import { getViewer } from "@/lib/auth";

export const metadata = { title: "Keşfet" };
export const dynamic = "force-dynamic";

/** `Explore` artboard: public plans by district. Works signed out. */
export default async function ExplorePage() {
  const [plans, viewer] = await Promise.all([listPublicPlans(), getViewer()]);
  return <ExploreView plans={plans} initials={viewer?.initials ?? "?"} />;
}
