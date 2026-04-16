/** @type {import('next').NextConfig} */
const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/auth/:path*',
        destination: `${backendUrl}/auth/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
      {
        source: '/img/:path*',
        destination: `${backendUrl}/img/:path*`,
      },
      {
        source: '/css/:path*',
        destination: `${backendUrl}/css/:path*`,
      },
      {
        source: '/js/:path*',
        destination: `${backendUrl}/js/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
