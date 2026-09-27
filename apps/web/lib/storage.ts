import "server-only";

import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

/**
 * Upload storage. Development keeps files on disk under `.data/uploads` and serves them from `/api/dosya/…`;
 * production should swap `put`/`remove` for a blob store (Vercel Blob / R2) — the rest of the app only sees URLs.
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

/** Store bytes; returns the public URL. */
export async function put(bytes: Uint8Array, mime: string): Promise<string> {
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
