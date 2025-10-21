# Supabase Database Setup Guide

## Overview
This guide will help you set up a complete Supabase database for the Maka Store e-commerce platform.

## Prerequisites
1. A Supabase account (sign up at https://supabase.com)
2. A new Supabase project created

## Setup Steps

### 1. Run SQL Scripts in Order

Go to your Supabase project dashboard → SQL Editor, and run these scripts in order:

1. **01-create-tables.sql** - Creates all database tables with proper relationships
2. **02-enable-rls.sql** - Enables Row Level Security and sets up policies
3. **03-seed-data.sql** - Adds sample data for testing
4. **04-storage-setup.sql** - Sets up storage buckets for images

### 2. Get Your Supabase Credentials

From your Supabase project settings:
- Go to Settings → API
- Copy your Project URL
- Copy your anon/public key

### 3. Add Environment Variables

Add these to your Vercel project or `.env.local`:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
\`\`\`

### 4. Install Supabase Packages

The following packages are already configured:
- `@supabase/supabase-js`
- `@supabase/ssr`

## Database Schema

### Tables Created:
- **customers** - Customer information
- **categories** - Product categories (with parent-child support)
- **products** - Main product information
- **product_images** - Product images with ordering
- **product_variants** - Product variants (sizes, colors, etc.)
- **orders** - Order information
- **order_items** - Individual items in orders
- **design_settings** - Store design customization
- **page_content** - Dynamic page content management

### Features:
- ✅ Full Arabic and English support
- ✅ Row Level Security (RLS) enabled
- ✅ Automatic timestamps with triggers
- ✅ Proper indexes for performance
- ✅ Foreign key relationships
- ✅ Sample data included

## Usage in Code

### Client-side (React Components):
\`\`\`typescript
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

const supabase = getSupabaseBrowserClient()
const { data, error } = await supabase.from('products').select('*')
\`\`\`

### Server-side (Server Components, API Routes):
\`\`\`typescript
import { getSupabaseServerClient } from '@/lib/supabase/server'

const supabase = await getSupabaseServerClient()
const { data, error } = await supabase.from('products').select('*')
\`\`\`

## Next Steps

1. Run the SQL scripts in your Supabase project
2. Add environment variables to your project
3. Test the connection by fetching data from the tables
4. Customize the sample data as needed
5. Set up authentication if needed for admin features

## Storage Buckets

Three storage buckets are created:
- `products` - For product images
- `categories` - For category images  
- `pages` - For page content images

All buckets are public for read access.

## Security Notes

- RLS is enabled on all tables
- Public users can only read active/published content
- Admin operations require service role key (not included for security)
- Customer data is protected - users can only access their own data
- Upload policies need to be configured based on your authentication setup
