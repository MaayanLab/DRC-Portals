/** @type {import('next').NextConfig} */

process.env.NEXTAUTH_URL_INTERNAL = 'http://localhost:3000/auth'

const nextConfig = {
  output: 'standalone',
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  async rewrites() {
    return [
      {
        source: '/:path*',
        has: [{type: 'host', value: 'cfde.info'}],
        destination: '/info/:path*',
      },
      {
        source: '/:path*',
        has: [{type: 'host', value: 'cfde.cloud'}],
        destination: '/data/:path*',
      },
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

module.exports = nextConfig
