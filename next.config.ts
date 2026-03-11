import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://api.rezervitoo.com/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
