import { Rail } from "@/components/shell/Rail";
import { getViewer } from "@/lib/auth";

/** Signed-in shell: icon rail on desktop; mobile tab bar comes with each screen. Pages decide whether sign-in is required. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  return (
    <div className="min-h-dvh md:pl-[var(--rail-w)]">
      <Rail initials={viewer?.initials ?? "?"} />
      {children}
    </div>
  );
}
