import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "devwork.vn",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
