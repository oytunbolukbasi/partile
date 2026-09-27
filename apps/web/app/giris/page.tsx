import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { getViewer } from "@/lib/auth";
import { routes } from "@/lib/routes";

export const metadata = { title: "Giriş" };

/** Maps to `Login`: e-mail → 6-digit code / magic link. `?next=` returns the user afterwards. */
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; hata?: string }> }) {
  const { next, hata } = await searchParams;
  const safeNext = next && next.startsWith("/") ? next : undefined;
  const viewer = await getViewer();
  if (viewer) redirect(viewer.onboarded ? safeNext || routes.home : routes.onboarding);
  return <LoginForm next={safeNext} error={hata === "kod" ? "Link geçersiz ya da süresi dolmuş. Yeni kod iste." : undefined} />;
}
