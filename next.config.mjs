/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
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
            "connect-src 'self' https://bbzjxcjfmeoiojjnfvfa.supabase.co wss://bbzjxcjfmeoiojjnfvfa.supabase.co http://localhost:* ws://localhost:* https://connect.facebook.net https://www.facebook.com; " +
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
