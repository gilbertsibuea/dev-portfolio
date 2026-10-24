import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    // Ensure proper metadata handling in Next.js 15.3.0
    serverComponentsExternalPackages: [],
    // Increase body size limit for video uploads (50MB)
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;
