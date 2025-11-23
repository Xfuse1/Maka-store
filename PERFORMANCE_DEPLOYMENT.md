# Performance Optimization Deployment Guide

## Database Optimization
Run the database optimization script on your Supabase instance:
```bash
psql -h your-supabase-host -U postgres -d postgres -f scripts/add-database-indexes.sql
```

## Build & Deploy
1. Build the optimized production version:
```bash
pnpm build
```

2. Deploy to Vercel (automatic optimization):
```bash
vercel --prod
```

## Verify Performance
After deployment, check Core Web Vitals at:
- PageSpeed Insights: https://pagespeed.web.dev/
- Chrome DevTools > Lighthouse
- Real User Monitoring in /api/analytics/vitals logs

## Target Metrics (Mobile)
- LCP (Largest Contentful Paint): < 2.5s ✅
- CLS (Cumulative Layout Shift): < 0.1 ✅
- INP (Interaction to Next Paint): < 200ms ✅
- FCP (First Contentful Paint): < 1.8s ✅
- TTFB (Time to First Byte): < 800ms ✅

## Optimizations Applied
✅ 1. Images: WebP/AVIF conversion, lazy-loading, responsive sizes
✅ 2. CSS/JS: Minification, tree-shaking, defer non-critical JS
✅ 3. Compression: Brotli enabled, browser/CDN caching
✅ 4. HTTP Requests: SVG sprite, optimized fonts
✅ 5. Database: Strategic indexes on all tables
✅ 6. SSR Caching: Query cache, paginated APIs
✅ 7. Preloading: dns-prefetch, preconnect, font preload
✅ 8. Code-splitting: Package imports optimized
✅ 9. Layout Stability: font-display:swap, explicit dimensions
✅ 10. Monitoring: Web Vitals tracking enabled
