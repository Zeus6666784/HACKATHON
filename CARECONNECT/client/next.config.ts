import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Using 'export' to allow Express to serve static assets
  output: 'export',
  allowedDevOrigins: [".monkeycode-ai.live"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
