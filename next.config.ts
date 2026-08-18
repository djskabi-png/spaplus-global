import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "app.spaplus.co",
        "spaplus-global-brand.adir-naor-7510.chatgpt.site",
      ],
    },
  },
};

export default nextConfig;
