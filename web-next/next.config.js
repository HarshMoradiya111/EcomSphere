/** @type {import('next').NextConfig} */
const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3001',
        pathname: '/uploads/**',
      },
    ],
  },
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
  async rewrites() {
    return [
      // API routes should still be rewritten
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      // Static assets from backend
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
