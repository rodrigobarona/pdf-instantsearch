import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "static.portadafrente.com",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
