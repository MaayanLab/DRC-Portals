import remarkGfm from "remark-gfm";
import createMDX from "@next/mdx";

process.env.NEXTAUTH_URL_INTERNAL = "http://localhost:3000/auth";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "data.cfde.cloud",
        "info.cfde.cloud",
        "cfde.cloud",
      ],
    },
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  async rewrites() {
    return {
      beforeFiles: [
        {
          has: [{ type: "host", value: "data.cfde.cloud" }],
          source: "/",
          destination: "/data",
        },
        {
          has: [{ type: "host", value: "info.cfde.cloud" }],
          source: "/",
          destination: "/info",
        },
      ],
      afterFiles: [
        {
          has: [{ type: "host", value: "data.cfde.cloud" }],
          source: "/:path*",
          destination: "/data/:path*",
        },
        {
          has: [{ type: "host", value: "info.cfde.cloud" }],
          source: "/:path*",
          destination: "/info/:path*",
        },
      ],
    };
  },
  async redirects() {
    return [
      {
        source: "/data/contribute/documentation",
        destination: "/data/submit",
        permanent: true,
      },
      {
        source: "/data/contribute/:path*",
        destination: "/data/submit/:path*",
        permanent: true,
      },
      {
        has: [{ type: "host", value: "data.cfde.cloud" }],
        source: "/info/:path*",
        destination: "https://info.cfde.cloud/:path*",
        permanent: false,
      },
      {
        has: [{ type: "host", value: "data.cfde.cloud" }],
        source: "/auth/:path*",
        destination: "https://cfde.cloud/auth/:path*",
        permanent: false,
      },
      {
        has: [{ type: "host", value: "info.cfde.cloud" }],
        source: "/data/:path*",
        destination: "https://data.cfde.cloud/:path*",
        permanent: false,
      },
      {
        has: [{ type: "host", value: "info.cfde.cloud" }],
        source: "/auth/:path*",
        destination: "https://cfde.cloud/auth/:path*",
        permanent: false,
      },
      {
        has: [{ type: "host", value: "cfde.cloud" }],
        source: "/",
        destination: "https://info.cfde.cloud",
        permanent: false,
      },
      {
        source: "/info/documentation",
        destination: "/data/documentation",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "minio.dev.maayanlab.cloud",
      },
      {
        protocol: "https",
        hostname: "cfde-drc.s3.amazonaws.com",
        port: "",
        pathname: "/assets/**",
      },
      {
        protocol: "https",
        hostname: "cfde-drc.s3.us-east-2.amazonaws.com",
        port: "",
        pathname: "/assets/**",
      },
    ],
  },
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.(".svg")
    );

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ["@svgr/webpack"],
      }
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);
