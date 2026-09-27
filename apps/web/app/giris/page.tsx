import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Giriş" };

/** Maps to `Login`: e-mail → 6-digit code / magic link via Resend (wired up last). `?next=` returns the user afterwards. */
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <LoginForm next={next && next.startsWith("/") ? next : undefined} />;
}
