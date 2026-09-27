import Link from "next/link";
import { routes } from "@/lib/routes";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="display text-[40px]">Bu sayfa yok</h1>
      <p className="text-muted">Link yanlış olabilir ya da plan kaldırılmış.</p>
      <Link href={routes.landing} className="mt-2 flex h-11 items-center rounded-pill bg-white px-5 font-extrabold text-bg">
        Ana sayfaya dön
      </Link>
    </main>
  );
}
