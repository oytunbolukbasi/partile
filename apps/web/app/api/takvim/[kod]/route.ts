import { NextResponse } from "next/server";
import { PlanCode } from "@partile/core";
import { getPlanByCode, roleFor } from "@partile/db";
import { getViewer } from "@/lib/auth";
import { icsText } from "@/lib/calendar";

/** `.ics` download for a plan. Full address only for hosts and guests who answered; others get the district. */
export async function GET(_req: Request, { params }: { params: Promise<{ kod: string }> }) {
  const { kod } = await params;
  const plan = PlanCode.safeParse(kod).success ? await getPlanByCode(kod) : null;
  if (!plan || !plan.startsAt) return new NextResponse("Bulunamadı", { status: 404 });
  const viewer = await getViewer();
  const role = await roleFor(plan.id, viewer?.id ?? null);
  const full = role === "host" || role === "going" || role === "maybe";
  const body = icsText(plan, full)!;
  return new NextResponse(body, {
    headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": `attachment; filename="${plan.code}.ics"`, "Cache-Control": "no-store" },
  });
}
