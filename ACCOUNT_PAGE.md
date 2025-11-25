# User Profile / Account Page Implementation

This document describes the implementation of the new User Account page functionality.

## Overview
A new protected route `/account` has been added to allow logged-in users to manage their profile, view orders, and access account settings.

## Files Created/Modified

### New Files
- `src/app/account/layout.tsx`:
  - Handles authentication protection (redirects to `/auth` if not logged in).
  - Provides the layout wrapper for the account section.
  
- `src/app/account/page.tsx`:
  - Server Component.
  - Fetches user profile from `profiles` table.
  - Fetches user orders from `orders` table.
  - Fetches user addresses from `addresses` table.
  - Passes data to the client component.

- `src/app/account/account-client.tsx`:
  - Client Component using Shadcn UI Tabs.
  - **Profile Tab**: Displays and allows editing of user name and phone.
  - **Orders Tab**: Lists user's past orders with status and total amount. Includes Order Details modal.
  - **Addresses Tab**: Lists addresses, allows adding/editing/deleting addresses and setting default.
  - **Settings Tab**: Provides a logout button.

- `src/app/account/actions.ts`:
  - Server Actions for account operations.
  - `fetchOrderDetails`: Fetches details for a specific order (securely).
  - `fetchAddresses`: Fetches user addresses.
  - `addAddress`, `updateAddress`, `deleteAddress`, `setDefaultAddress`: CRUD for addresses.

- `scripts/27-create-addresses-table.sql`:
  - SQL migration script to create the `addresses` table and RLS policies.

### Modified Files
- `src/components/site-header.tsx`:
  - Updated to show a "My Account" link (with User icon) instead of just a logout button when the user is authenticated.

- `src/components/mobile-navigation.tsx`:
  - Added "My Account" link in the mobile menu for authenticated users.

## Functionality Details

### Authentication & Protection
- Uses Supabase Auth (`getUser` on server) to ensure only authenticated users can access the route.
- Redirects unauthenticated users to the login page with a message.

### Data Fetching
- **Profile**: Fetched from `profiles` table based on `user.id`.
- **Orders**: Fetched from `orders` table filtering by `user_id`.
- **Addresses**: Fetched from `addresses` table.

### Profile Updates
- Uses `upsert` on the `profiles` table to update name and phone number.
- Updates are handled client-side with optimistic UI feedback (alert on success).

### Orders Display & Details
- Shows a list of orders sorted by date.
- Displays Order ID, Date, Status (colored badge), and Total Amount.
- "Details" button opens a modal showing items, prices, and shipping address.

### Address Management
- Full CRUD support for multiple addresses.
- "Set as Default" functionality.
- Address form includes label, full name, phone, street, city, state, postal code.

## Database Schema (Addresses)
The `addresses` table includes:
- `id`: UUID PK
- `user_id`: UUID FK to auth.users
- `label`: Text (e.g. Home, Work)
- `full_name`, `phone`, `street`, `city`, `state`, `postal_code`, `country`: Text fields
- `is_default`: Boolean
- `created_at`: Timestamp

## Future Improvements
- Add "Change Password" functionality in the Settings tab.
- Integrate address selection into Checkout flow (using `is_default` or allowing selection).
