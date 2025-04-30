import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Disable ESLint during build for now
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://omtransport-dash.onrender.com/:path*', // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;
