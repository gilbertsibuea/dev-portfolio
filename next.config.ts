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
    // Note: this only affects Server Actions — NOT Route Handlers.
    // On Vercel, Function body limit is hard-capped at 4.5MB; large media
    // must use Vercel Blob client uploads (see lib/admin-upload.ts).
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;
