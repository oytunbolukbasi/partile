import { notFound } from "next/navigation";
import { getPlanByCode, isHost } from "@partile/db";
import { CreateEditor } from "@/components/create/CreateEditor";
import { getViewer } from "@/lib/auth";

export const metadata = { title: "Plan oluştur" };
export const dynamic = "force-dynamic";

/**
 * Maps to `Create` / `CreateMobile`. Works signed out (draft in the browser); publishing asks for e-mail verification.
 * `?kod=` edits an existing plan (hosts only); `?yayinla=1` publishes the stored draft right after sign-in.
 */
export default async function CreatePage({ searchParams }: { searchParams: Promise<{ kod?: string; yayinla?: string }> }) {
  const { kod, yayinla } = await searchParams;
  const viewer = await getViewer();
  if (kod) {
    const plan = await getPlanByCode(kod);
    if (!plan || !viewer || !(await isHost(plan.id, viewer.id))) notFound();
    return <CreateEditor viewer={viewer} existing={plan} />;
  }
  return <CreateEditor viewer={viewer} autoPublish={yayinla === "1"} />;
}
