import type { NextConfig } from "next";

import { resolve } from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Railway runs the standalone server; the monorepo root keeps workspace packages in the trace.
  output: "standalone",
  outputFileTracingRoot: resolve(__dirname, "../.."),
  transpilePackages: ["@partile/core", "@partile/ui-tokens", "@partile/db"],
  serverExternalPackages: ["@electric-sql/pglite", "pg"],
  images: { remotePatterns: [] },
  // The OG card reads the self-hosted woff files at runtime.
  outputFileTracingIncludes: { "/e/[kod]/opengraph-image": ["./app/fonts/**"] },
};

export default nextConfig;
