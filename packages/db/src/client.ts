import { existsSync, mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { dirname, join, resolve } from "node:path";
import { drizzle as drizzleNeon, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { drizzle as drizzlePglite, type PgliteDatabase } from "drizzle-orm/pglite";
import * as schema from "./schema";

export type Db = PgliteDatabase<typeof schema> | NeonHttpDatabase<typeof schema>;

type Cache = { db?: Promise<Db> };
const g = globalThis as unknown as { __partileDb?: Cache };
const cache = (g.__partileDb ??= {});

/** Walk up from cwd until the db package's migrations folder is found (dev: apps/web or repo root). */
function migrationsFolder(): string {
  if (process.env.DB_MIGRATIONS_DIR) return process.env.DB_MIGRATIONS_DIR;
  let dir = process.cwd();
  for (let i = 0; i < 6; i++) {
    const candidate = join(dir, "packages", "db", "drizzle");
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error("packages/db/drizzle not found; run `pnpm --filter @partile/db generate` or set DB_MIGRATIONS_DIR");
}

/** Local file-backed Postgres (PGlite) next to the repo root, unless DATABASE_URL points at Neon. */
async function open(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  if (url && url.startsWith("postgres")) {
    const { neon } = await import("@neondatabase/serverless");
    return drizzleNeon({ client: neon(url), schema });
  }
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const dataDir = process.env.PGLITE_DATA_DIR ?? resolve(dirname(migrationsFolder()), "../../.data/partile");
  mkdirSync(dataDir, { recursive: true });
  // Load PGlite's ESM build through Node's own loader (hidden from the bundler): the bundled/CJS path
  // breaks its wasm loading inside the Next.js server runtime. pnpm links the package under packages/db.
  const dist = process.env.PGLITE_DIST_DIR ?? join(dirname(migrationsFolder()), "node_modules", "@electric-sql", "pglite", "dist");
  const nativeImport = new Function("p", "return import(p)") as (p: string) => Promise<typeof import("@electric-sql/pglite")>;
  const { PGlite } = await nativeImport(pathToFileURL(join(dist, "index.js")).href);
  const client = new PGlite(dataDir);
  const db = drizzlePglite({ client, schema });
  await migrate(db, { migrationsFolder: migrationsFolder() });
  const { seedIfEmpty } = await import("./seed");
  await seedIfEmpty(db);
  return db;
}

/** Shared connection; cached on globalThis so dev hot reloads reuse it. */
export function getDb(): Promise<Db> {
  return (cache.db ??= open().catch((e) => {
    cache.db = undefined;
    throw e;
  }));
}
