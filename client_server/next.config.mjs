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
        protocol: "https",
        hostname: "static.devworks.jp",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
