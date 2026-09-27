import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@partile/core", "@partile/ui-tokens", "@partile/db"],
  serverExternalPackages: ["@electric-sql/pglite"],
  images: { remotePatterns: [] },
};

export default nextConfig;
