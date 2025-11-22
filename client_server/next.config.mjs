/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "devwork.vn",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "37003",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "37003",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "static.devworks.jp",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn-new.topcv.vn",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    const host = process.env.FILE_SYSTEM_HOST || "localhost";
    const port = process.env.FILE_SYSTEM_PORT || "37003";
      return [
      {
        source: "/files/:path*",
        destination: `http://${host}:${port}/files/:path*`,
      },
    ];
  },
};

export default nextConfig;
