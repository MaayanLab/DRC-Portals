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
        destination: "/v1",
        permanent: false,
      }
    ]}
};

export default nextConfig;
