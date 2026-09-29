import type { NextConfig } from "next";

const apiBaseUrl = (process.env.API_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${apiBaseUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
