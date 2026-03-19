/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // For Cloud Run deployment
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  // Serve assets folder as static files
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        {
          source: '/assets/:path*',
          destination: '/assets/:path*',
        },
      ],
    };
  },
};

module.exports = nextConfig;
