import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@partile/core", "@partile/ui-tokens"],
  images: { remotePatterns: [] },
};

export default nextConfig;
