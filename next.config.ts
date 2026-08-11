import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This is a design demo — the dev badge sits on top of the account avatar.
  devIndicators: false,
  // Konva ships a Node-only `canvas` backend it tries to resolve during the
  // server build. The editor is client-only, so stub it out.
  turbopack: {
    resolveAlias: {
      canvas: "./src/lib/empty-module.ts",
    },
  },
  webpack: (config) => {
    config.resolve.alias = { ...config.resolve.alias, canvas: false };
    return config;
  },
};

export default nextConfig;
