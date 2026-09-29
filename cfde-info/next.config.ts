import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    output: "export",
    trailingSlash: true,
    images: {
      unoptimized: true,
    },
    async redirects() {
    return [
      {
        source: "/",
        destination: "/v3",
        permanent: false,
      }
    ]}
};

export default nextConfig;
