import "server-only";

import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

/**
 * Upload storage on disk: `.data/uploads` in development, the Railway volume (`UPLOAD_DIR=/data/uploads`) in
 * production; files are served from `/api/dosya/…`. The rest of the app only sees URLs, so a blob store can replace
 * `put`/`get`/`remove` later.
 */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp" };

function uploadDir(): string {
  if (process.env.UPLOAD_DIR) return process.env.UPLOAD_DIR;
  let dir = process.cwd();
  for (let i = 0; i < 6; i++) {
    if (existsSync(join(dir, "pnpm-workspace.yaml"))) return join(dir, ".data", "uploads");
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return join(process.cwd(), ".data", "uploads");
}

export const isImageType = (mime: string) => mime in TYPES;

const MAX_EDGE = 2048;

/**
 * Stills are rotated by EXIF, fitted inside 2048 px and re-encoded as WebP; metadata (incl. GPS) is dropped.
 * Animated GIF/WebP stay as they are. If sharp is unavailable or the image is odd, the original bytes are kept.
 */
async function optimize(bytes: Uint8Array, mime: string): Promise<{ bytes: Uint8Array; mime: string }> {
  if (mime === "image/gif") return { bytes, mime };
  try {
    const { default: sharp } = await import("sharp");
    const meta = await sharp(bytes).metadata();
    if ((meta.pages ?? 1) > 1) return { bytes, mime };
    const out = await sharp(bytes, { failOn: "none" })
      .rotate()
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    return { bytes: new Uint8Array(out), mime: "image/webp" };
  } catch (e) {
    console.error("[storage] optimize failed, keeping original", e);
    return { bytes, mime };
  }
}

/** Store bytes (optimized); returns the public URL. */
export async function put(input: Uint8Array, inputMime: string): Promise<string> {
  if (!TYPES[inputMime]) throw new Error("unsupported type");
  const { bytes, mime } = await optimize(input, inputMime);
  const ext = TYPES[mime];
  if (!ext) throw new Error("unsupported type");
  const dir = uploadDir();
  await mkdir(dir, { recursive: true });
  const name = `${randomUUID()}.${ext}`;
  await writeFile(join(dir, name), bytes);
  return `/api/dosya/${name}`;
}

export async function get(name: string): Promise<{ bytes: Buffer; mime: string } | null> {
  if (!/^[a-f0-9-]{36}\.(jpg|png|gif|webp)$/.test(name)) return null;
  try {
    const bytes = await readFile(join(uploadDir(), name));
    const ext = name.split(".").pop()!;
    const mime = Object.entries(TYPES).find(([, e]) => e === ext)?.[0] ?? "application/octet-stream";
    return { bytes, mime };
  } catch {
    return null;
  }
}

export async function remove(url: string): Promise<void> {
  const name = url.split("/").pop() ?? "";
  if (!/^[a-f0-9-]{36}\.(jpg|png|gif|webp)$/.test(name)) return;
  try {
    await unlink(join(uploadDir(), name));
  } catch {
    /* already gone */
  }
}

/** A `data:` URL (poster picked while signed out) becomes a stored file; other URLs pass through. */
export async function materialize(url: string | undefined): Promise<string | undefined> {
  if (!url || !url.startsWith("data:")) return url;
  const m = /^data:([^;]+);base64,(.+)$/.exec(url);
  if (!m || !isImageType(m[1]!)) return undefined;
  const bytes = Buffer.from(m[2]!, "base64");
  if (bytes.byteLength > MAX_UPLOAD_BYTES) return undefined;
  return put(bytes, m[1]!);
}
