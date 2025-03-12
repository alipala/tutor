/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  env: {
    BACKEND_URL: process.env.NODE_ENV === 'production'
      ? process.env.BACKEND_URL || 'https://tutor-production.up.railway.app'
      : 'http://localhost:3001',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? (process.env.BACKEND_URL || 'https://tutor-production.up.railway.app') + '/api/:path*'
          : 'http://localhost:3001/api/:path*',
      },
    ];
  },
}

module.exports = nextConfig
