import { redirect } from "next/navigation";
import { Onboarding } from "@/components/auth/Onboarding";
import { requireViewer } from "@/lib/auth";
import { routes } from "@/lib/routes";

export const metadata = { title: "Hoş geldin" };

/** Maps to `Onboarding`: first sign-in only. */
export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const safeNext = next && next.startsWith("/") ? next : undefined;
  const viewer = await requireViewer(routes.onboarding);
  if (viewer.onboarded) redirect(safeNext || routes.home);
  return <Onboarding viewer={viewer} next={safeNext} />;
}
