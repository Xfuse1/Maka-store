# Homepage Sections Management System - Complete Guide

## Overview
Complete triple synchronization system for managing homepage sections with real-time updates between admin dashboard, database, and frontend.

## System Architecture

### 1. Database Layer
- **Table**: `homepage_sections`
- **Auto-populated** with existing sections on first run
- **RLS enabled** for security
- **Real-time enabled** for instant updates

### 2. Admin Dashboard
- **Location**: `/admin/homepage-sections`
- **Features**:
  - View all sections with current status
  - Add new sections with templates
  - Edit section properties (name, type, items count, layout)
  - Delete sections
  - Toggle visibility (active/inactive)
  - Drag & drop reordering
  - Real-time save indicators

### 3. Frontend Display
- **Location**: `/` (Homepage)
- **Features**:
  - Dynamic section rendering from database
  - Real-time updates when admin makes changes
  - Automatic section ordering
  - Conditional rendering based on section type

## Setup Instructions

### Step 1: Run Database Script
\`\`\`bash
# Run the SQL script to create the table and populate existing sections
scripts/13-homepage-sections-complete.sql
\`\`\`

This will:
- Create the `homepage_sections` table
- Auto-populate with 5 existing sections:
  - الأكثر مبيعاً (Best Sellers)
  - المنتجات الجديدة (New Products)
  - المنتجات المميزة (Featured Products)
  - تسوقي حسب الفئة (Categories)
  - آراء العملاء (Customer Reviews)
- Enable RLS policies
- Create helper functions

### Step 2: Access Admin Dashboard
1. Navigate to `/admin/homepage-sections`
2. You'll see all auto-discovered sections
3. Each section shows:
   - Arabic and English names
   - Section type
   - Display order
   - Active status
   - Number of items
   - Layout type
   - Background color

### Step 3: Manage Sections

#### Add New Section
1. Click "إضافة قسم جديد" (Add New Section)
2. Fill in the form:
   - Name in Arabic (required)
   - Name in English (optional)
   - Section type (best_sellers, new_arrivals, featured, categories, reviews, custom)
   - Number of items to display
   - Layout type (grid, slider, list)
   - Background color
   - Active status
3. Click "حفظ" (Save)
4. Section appears immediately on homepage

#### Edit Section
1. Click the edit icon (pencil) on any section
2. Modify any properties
3. Click "حفظ" (Save)
4. Changes reflect immediately on homepage

#### Toggle Visibility
1. Click the eye icon to toggle active/inactive
2. Inactive sections don't appear on homepage
3. Change is instant

#### Reorder Sections
1. Drag sections using the grip icon
2. Drop in desired position
3. Order saves automatically
4. Homepage updates immediately

#### Delete Section
1. Click the trash icon
2. Confirm deletion
3. Section removed from database and homepage

## Real-Time Synchronization

### How It Works
1. **Admin makes change** → Saves to database
2. **Database triggers event** → Supabase Realtime broadcasts
3. **Homepage listens** → Receives update notification
4. **Frontend refetches** → Gets latest sections
5. **UI updates** → Shows new content instantly

### No Page Reload Required
All changes happen in real-time without refreshing the page.

## Section Types

### Available Types
1. **best_sellers** - الأكثر مبيعاً
   - Shows top-selling products
   - Red badge
   - Trending icon

2. **new_arrivals** - المنتجات الجديدة
   - Shows newest products
   - Green badge
   - Sparkles icon

3. **featured** - المنتجات المميزة
   - Shows featured products
   - Primary badge
   - No icon

4. **categories** - التصنيفات
   - Shows product categories
   - Grid layout with images

5. **reviews** - آراء العملاء
   - Shows customer reviews
   - Slider layout

6. **custom** - مخصص
   - Custom section type
   - Flexible configuration

## Testing Checklist

- [ ] All existing sections appear in admin dashboard
- [ ] Can add new section and it appears on homepage
- [ ] Can edit section and changes reflect immediately
- [ ] Can toggle visibility and section shows/hides
- [ ] Can reorder sections and order updates on homepage
- [ ] Can delete section and it disappears from homepage
- [ ] Real-time updates work without page refresh
- [ ] Database maintains accurate state
- [ ] RLS policies protect data appropriately

## Troubleshooting

### Sections Not Appearing
1. Check if section is marked as active
2. Verify database connection
3. Check browser console for errors
4. Ensure RLS policies are correct

### Real-Time Not Working
1. Check Supabase Realtime is enabled
2. Verify subscription is active
3. Check browser console for connection errors
4. Ensure table has proper permissions

### Changes Not Saving
1. Check admin authentication
2. Verify database permissions
3. Check server actions are working
4. Review error messages in console

## API Reference

### Server Actions

#### `getAllSections()`
Fetches all homepage sections ordered by display_order

#### `createSection(section)`
Creates a new homepage section

#### `updateSection(id, updates)`
Updates an existing section

#### `deleteSection(id)`
Deletes a section

#### `toggleSectionVisibility(id, isActive)`
Toggles section active status

#### `reorderSections(sectionIds)`
Updates display order for multiple sections

## Database Schema

\`\`\`sql
CREATE TABLE homepage_sections (
    id UUID PRIMARY KEY,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    section_type VARCHAR(100) NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    max_items INTEGER DEFAULT 8,
    product_ids JSONB DEFAULT '[]',
    category_ids JSONB DEFAULT '[]',
    layout_type VARCHAR(50) DEFAULT 'grid',
    show_title BOOLEAN DEFAULT true,
    show_description BOOLEAN DEFAULT true,
    background_color VARCHAR(50) DEFAULT 'background',
    custom_content JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

## Success Criteria

✅ Admin can see all existing homepage sections
✅ Admin can add, edit, delete sections
✅ Admin can reorder sections with drag & drop
✅ Admin can toggle section visibility
✅ All changes save to database immediately
✅ Homepage updates in real-time without refresh
✅ Database maintains accurate state
✅ System is secure with RLS policies

## Support

For issues or questions:
1. Check browser console for errors
2. Verify database connection
3. Review this guide
4. Check Supabase dashboard for table status
