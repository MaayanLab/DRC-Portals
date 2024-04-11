import remarkGfm from 'remark-gfm'
import createMDX from '@next/mdx'

process.env.NEXTAUTH_URL_INTERNAL = 'http://localhost:3000/auth'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  async rewrites() {
    return [
      {
        source: '/:root/auth/:path*',
        destination: '/auth/:path*',
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: "s3.amazonaws.com",
      },
      {
        protocol: 'https',
        hostname: 'cfde-drc.s3.amazonaws.com',
        port: '',
        pathname: '/assets/**',
      },
    ],
  },
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg'),
    )

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
        use: ['@svgr/webpack'],
      },
    )

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i

    return config
  }
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
  },
})

export default withMDX(nextConfig)
