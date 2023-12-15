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
    ],
  }
}

module.exports = nextConfig
