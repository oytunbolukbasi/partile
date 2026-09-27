import { Onboarding } from "@/components/auth/Onboarding";

export const metadata = { title: "Hoş geldin" };

/** Maps to `Onboarding`: first sign-in only. */
export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <Onboarding next={next && next.startsWith("/") ? next : undefined} />;
}
