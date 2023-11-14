/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
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
