import { NextResponse } from "next/server";
import { addPhoto, canUploadPhoto, getPlanByCode } from "@partile/db";
import { getViewer } from "@/lib/auth";
import { MAX_UPLOAD_BYTES, isImageType, put } from "@/lib/storage";
import { routes } from "@/lib/routes";
import { revalidatePath } from "next/cache";

/**
 * Multipart upload: `file` + `kind` (`poster` | `photo`) + `code` (photo only).
 * Posters just return a URL for the draft; photos are attached to the plan's album.
 */
export async function POST(req: Request) {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "Önce giriş yap." }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file");
  const kind = String(form.get("kind") ?? "poster");
  if (!(file instanceof File)) return NextResponse.json({ error: "Dosya yok." }, { status: 400 });
  if (!isImageType(file.type)) return NextResponse.json({ error: "Yalnızca JPG, PNG, GIF ya da WebP." }, { status: 415 });
  if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "En fazla 8 MB." }, { status: 413 });

  if (kind === "photo") {
    const code = String(form.get("code") ?? "");
    const plan = await getPlanByCode(code);
    if (!plan) return NextResponse.json({ error: "Plan bulunamadı." }, { status: 404 });
    if (!(await canUploadPhoto(plan.id, viewer.id))) return NextResponse.json({ error: "Bu albüme yükleme izni yok." }, { status: 403 });
    const url = await put(new Uint8Array(await file.arrayBuffer()), file.type);
    const id = await addPhoto(plan.id, viewer.id, url);
    revalidatePath(routes.plan(code));
    return NextResponse.json({ id, url });
  }

  const url = await put(new Uint8Array(await file.arrayBuffer()), file.type);
  return NextResponse.json({ url });
}
