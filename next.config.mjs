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
          value:
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
            "connect-src 'self' https://bbzjxcjfmeoiojjnfvfa.supabase.co wss://bbzjxcjfmeoiojjnfvfa.supabase.co http://localhost:* ws://localhost:*; " +
            "img-src 'self' data: blob: https:; " +
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
