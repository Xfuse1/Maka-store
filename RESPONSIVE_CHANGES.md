Admin Area Responsive Changes

Date: 2025-11-25

Summary:
This change set makes the admin area layout and key admin pages more usable on small mobiles, normal mobiles, tablets and desktops without touching any backend logic, API routes, or database schema.

Files modified:
- src/components/admin/admin-utils.tsx
  - Added `TableWrapper` and `ResponsiveCardRow` helpers to provide consistent overflow handling and stacking behavior.

- src/app/admin/orders/page.tsx
  - Responsive paddings: `p-4 sm:p-6 lg:p-8`.
  - Card header stacks on small screens (`flex-col sm:flex-row`) so icons, titles and totals don't get cramped.
  - Customer info area uses `grid-cols-1 sm:grid-cols-3` for readable columns on mobile.
  - Button row is allowed to wrap (`flex-wrap`) to avoid overflow.
  - Dialog content max width adjusted to `max-w-full sm:max-w-2xl` for narrow screens.

- src/app/admin/products/page.tsx
  - Responsive paddings: `p-4 sm:p-6 lg:p-8`.
  - Header section stacks on small screens instead of squeezing action buttons.
  - Product cards now stack vertically on small screens (`flex-col sm:flex-row`) with responsive image sizes (full-width preview on mobile, fixed thumbnail on larger screens).
  - Action rows now wrap when space is limited.
  - Dialog content max width adjusted to `max-w-full sm:max-w-3xl` for narrow screens.

What I did (approach):
- Preferred mobile-first Tailwind classes (`flex-col sm:flex-row`, `grid-cols-1 sm:grid-cols-3`, `p-4 sm:p-6 lg:p-8`).
- Avoided fixed widths where they restrict responsiveness; replaced with `w-full`, `min-w-*` and `flex-shrink-0` where needed.
- Ensured that tables (future) will be wrapped with `TableWrapper` to allow horizontal scrolling inside the table area without causing page-level overflow.
- Did not change any database, server, or Supabase code. All logic and API routes remain untouched.

Suggested next steps:
- Apply the `TableWrapper` around any pages that render `<table>` elements (e.g. customers/users, payments) — I added the helper so you can use it consistently.
- Test the following breakpoints: 360×640, 390×844, 768×1024, Desktop. Focus on: /admin, /admin/products, /admin/orders, /admin/pages, /admin/reviews, /admin/settings.
- If you want, I can continue and systematically update the remaining admin pages (pages/*, reviews, settings, analytics) the same way.

If you'd like me to commit these changes and continue with the rest of the `/admin` pages now, say "Continue — update remaining admin pages" and I will proceed.
