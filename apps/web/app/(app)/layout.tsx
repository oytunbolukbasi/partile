import { Rail } from "@/components/shell/Rail";

/** Signed-in shell: icon rail on desktop; mobile tab bar comes with the mobile screens. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh md:pl-[var(--rail-w)]">
      <Rail />
      {children}
    </div>
  );
}
