# Dynamic Design System - Usage Guide

## Overview
The site now has a **fully dynamic design system** where all visual styles (colors, fonts, layout) can be changed from the admin panel and will apply **instantly across the entire website**.

## How It Works

### 1. **Admin Design Page** (`/admin/design`)
This is your control panel for the entire site's appearance:

- **الألوان الأساسية** (Primary Colors)
  - اللون الأساسي (Primary Color) - Used for buttons, links, highlights
  - لون الخلفية (Background Color) - Page background color
  - لون النص (Foreground Color) - Text color

- **الخطوط** (Fonts)
  - خط العناوين (Heading Font) - Font for all headings (h1, h2, h3, etc.)
  - خط النصوص (Body Font) - Font for body text

- **إعدادات التخطيط** (Layout Settings)
  - عرض الحاوية (Container Width) - Maximum width of content
  - نصف القطر (Border Radius) - Roundness of buttons, cards, etc.

- **شعار الموقع** (Site Logo)
  - Upload and change the site logo
  - Appears in header, sidebar, and all pages

### 2. **How to Change Styles**

#### Step 1: Go to Admin Design Page
```
/admin/design
```

#### Step 2: Change Any Setting
- **Colors**: Click the color picker or type a hex code (e.g., `#FF0000` for red)
- **Fonts**: Type font name (e.g., `Cairo`, `Tajawal`, `Arial`)
- **Layout**: Type values with units (e.g., `1400px`, `0.75rem`)
- **Logo**: Click "رفع شعار جديد" and select an image file

#### Step 3: Click Save
- "حفظ الألوان" - Saves colors to database
- "حفظ الخطوط" - Saves fonts to database  
- "حفظ التخطيط" - Saves layout to database
- "حفظ الشعار الجديد" - Uploads logo to Supabase storage

#### Step 4: See Changes Immediately
- **Current tab**: Changes appear instantly when you save
- **Other users**: Refresh the page to see new design
- **All pages**: Home, products, cart, checkout - everything updates!

## Technical Implementation

### Database Storage
All settings are stored in the `design_settings` table:
- `key: 'colors'` - Stores primary, background, foreground colors
- `key: 'fonts'` - Stores heading and body font names
- `key: 'layout'` - Stores container width and border radius
- `key: 'site_logo'` - Stores logo URL and metadata

### Files Uploaded to Supabase Storage
- **Logo**: `storage/site-logo/` bucket
- **Category Images**: `storage/categories/` bucket

### CSS Variables Applied
When you change settings, these CSS variables update globally:
```css
--primary         /* Primary color (OKLCH format) */
--primary-hex     /* Primary color (HEX format) */
--background      /* Background color */
--background-hex  /* Background color (HEX) */
--foreground      /* Text color */
--foreground-hex  /* Text color (HEX) */
--font-heading    /* Font for headings */
--font-body       /* Font for body text */
--container-width /* Max content width */
--radius          /* Border radius */
```

### Custom Utility Classes
Use these classes for dynamic styling:
```css
.bg-primary-custom     /* Background with admin-set primary color */
.text-primary-custom   /* Text with admin-set primary color */
.border-primary-custom /* Border with admin-set primary color */
.bg-background-custom  /* Background with admin-set background color */
.text-foreground-custom /* Text with admin-set foreground color */
```

## Required SQL Migrations

Before using the design system, run these SQL scripts in Supabase SQL Editor:

1. **Logo Storage** (`scripts/16-create-logo-storage.sql`)
   - Creates `site-logo` storage bucket
   - Sets up RLS policies for public read, admin write

2. **Category Storage** (`scripts/17-create-categories-storage.sql`)
   - Creates `categories` storage bucket
   - For category images

3. **Design Settings** (`scripts/18-design-settings-defaults.sql`)
   - Adds default color/font/layout entries
   - Required for the system to work

## Example: Changing Site Colors

### Before:
Site uses default pink theme (`#FFB6C1`)

### Steps:
1. Go to `/admin/design`
2. Click "اللون الأساسي" color picker
3. Select a new color (e.g., blue `#0066CC`)
4. Click "حفظ الألوان"

### After:
- All buttons are now blue
- All links are now blue  
- All primary UI elements are now blue
- Changes persist across browser sessions
- All users see the new blue theme

## Advanced Usage

### Custom Components
To use dynamic colors in your own components:

```tsx
// Using Tailwind classes (automatically uses CSS variables)
<div className="bg-primary text-primary-foreground">
  Primary colored element
</div>

// Using custom utility classes
<div className="bg-primary-custom">
  Custom primary background
</div>

// Accessing store directly
import { useDesignStore } from "@/store/design-store"

function MyComponent() {
  const { colors, fonts } = useDesignStore()
  
  return (
    <div style={{ backgroundColor: colors.primary }}>
      Custom element
    </div>
  )
}
```

### Programmatic Access
```typescript
import { useDesignStore } from "@/store/design-store"

const { colors, fonts, layout, setColor, loadFromDatabase } = useDesignStore()

// Load fresh from database
await loadFromDatabase()

// Change color locally (won't persist)
setColor('primary', '#FF0000')
```

## Troubleshooting

### Changes Not Appearing?
1. Check browser console for errors
2. Verify SQL migrations were run
3. Hard refresh (`Ctrl + Shift + R` or `Cmd + Shift + R`)
4. Check Supabase credentials in `.env.local`

### Logo Not Uploading?
1. Verify `site-logo` bucket exists in Supabase
2. Check file size (max 5MB)
3. Check file type (JPG, PNG, WebP, SVG only)
4. Verify service role key in `.env.local`

### Colors Look Wrong?
- Colors are converted from HEX to OKLCH format
- Some colors may appear slightly different
- Use hex codes for exact matching

## Future Enhancements
- [ ] Dark mode toggle
- [ ] Multiple color themes (save/load presets)
- [ ] Font preview before applying
- [ ] Advanced layout options (grid, spacing)
- [ ] Export/import design settings
