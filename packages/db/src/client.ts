import { existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite, type PgliteDatabase } from "drizzle-orm/pglite";
import * as schema from "./schema";

export type Db = PgliteDatabase<typeof schema> | NodePgDatabase<typeof schema>;

type Cache = { db?: Promise<Db> };
const g = globalThis as unknown as { __partileDb?: Cache };
const cache = (g.__partileDb ??= {});

/** Walk up from cwd until the db package's migrations folder is found (dev: apps/web or repo root). Override with DB_MIGRATIONS_DIR (production image). */
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

/**
 * DATABASE_URL set → Postgres over TCP (Railway Postgres, Neon, …) with migrations applied at boot
 * (DB_AUTO_MIGRATE=0 disables) and sample content only when SEED_SAMPLE=1.
 * Otherwise a file-backed PGlite next to the repo root, always seeded (development).
 */
async function open(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  if (url && url.startsWith("postgres")) {
    const { Pool } = await import("pg");
    const { migrate } = await import("drizzle-orm/node-postgres/migrator");
    // Hosted Postgres (Neon, Railway) needs TLS; we set it explicitly and drop the libpq-style params
    // (sslmode, channel_binding) that node-postgres warns about.
    const u = new URL(url);
    const needsSsl = u.searchParams.get("sslmode") !== "disable" && (u.searchParams.has("sslmode") || process.env.PGSSL === "1" || !/^(localhost|127\.0\.0\.1)$/.test(u.hostname));
    u.searchParams.delete("sslmode");
    u.searchParams.delete("channel_binding");
    const pool = new Pool({ connectionString: u.toString(), ssl: needsSsl ? { rejectUnauthorized: false } : undefined, max: 10 });
    const db = drizzlePg({ client: pool, schema });
    if (process.env.DB_AUTO_MIGRATE !== "0") await migrate(db, { migrationsFolder: migrationsFolder() });
    if (process.env.SEED_SAMPLE === "1") {
      const { seedIfEmpty } = await import("./seed");
      await seedIfEmpty(db);
    }
    return db;
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
