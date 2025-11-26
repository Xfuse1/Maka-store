/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 3600,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bbzjxcjfmeoiojjnfvfa.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'fmeeioiajtyfvfa.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Allow externally hosted images from i.postimg.cc (used by some test content)
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
        pathname: '/**',
      },
    ],
  },
  compress: true,
  reactStrictMode: true,
  poweredByHeader: false,
}

// Security headers: add a Content-Security-Policy to prevent unexpected
// third-party script injection (e.g. browser extensions or AV tooling)
// while allowing Next.js development features (HMR/Fast Refresh require
// 'unsafe-inline' and 'unsafe-eval' in dev mode).
nextConfig.headers = async () => {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          // Allow Next.js dev server inline scripts and eval for HMR/Fast Refresh.
          // In production, consider tightening this further or using nonces.
          // Added minimal origins required for Meta Pixel (connect.facebook.net and www.facebook.com)
          value:
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net; " +
            "connect-src 'self' https://bbzjxcjfmeoiojjnfvfa.supabase.co wss://bbzjxcjfmeoiojjnfvfa.supabase.co http://localhost:* ws://localhost:* https://connect.facebook.net https://www.facebook.com https://signals.birchub.events https://7pdiumnsps.us-east-2.awsapprunner.com; " +
            "img-src 'self' data: blob: https: https://www.facebook.com; " +
            "style-src 'self' 'unsafe-inline'; " +
            "font-src 'self' data:;",
        },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'no-referrer-when-downgrade' },
      ],
    },
  ]
}

export default nextConfig
