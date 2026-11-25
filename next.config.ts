import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Updates can carry up to four images, shrunk in the browser first.
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
