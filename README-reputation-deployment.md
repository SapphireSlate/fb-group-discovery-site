# User Reputation System and Badges - Deployment Guide

This document provides step-by-step instructions for deploying the User Reputation System and Badges feature.

## Prerequisites

Before deploying this feature, ensure you have:

1. Admin access to your Supabase project
2. Access to your code repository
3. Vercel account or equivalent deployment platform
4. Appropriate environment variables set up

## Table of Contents

1. [Database Schema Deployment](#database-schema-deployment)
2. [Backend API Deployment](#backend-api-deployment)
3. [Frontend Components Deployment](#frontend-components-deployment)
4. [Configuring Initial Badges](#configuring-initial-badges)
5. [Post-Deployment Testing](#post-deployment-testing)
6. [Troubleshooting](#troubleshooting)

## Database Schema Deployment

### Step 1: Deploy Database Migrations

You need to deploy three migration files to set up the required database schema:

#### Option 1: Using Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Log in to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

#### Option 2: Manual SQL Execution

1. Navigate to the Supabase Dashboard > SQL Editor
2. Execute the following migration files in order:
   - `supabase/migrations/20250405_003_user_reputation.sql`
   - `supabase/migrations/20250406_003_reputation_views.sql`

### Step 2: Verify Database Schema

After deploying the migrations, verify that the tables and views were created correctly:

1. Go to Supabase Dashboard > Table Editor
2. Confirm the following tables exist:
   - `badges`
   - `user_badges`
   - `reputation_history`
3. Verify that the `users` table has the following new columns:
   - `reputation_points`
   - `reputation_level`
   - `badges_count`
4. Confirm the `reputation_leaderboard` view exists

## Backend API Deployment

### Step 1: Deploy API Endpoints

Ensure the following files are deployed:

1. `lib/reputation.ts` - Core utility functions
2. `app/api/badges/route.ts` - Badges API
3. `app/api/user-badges/route.ts` - User badges API
4. `app/api/reputation/route.ts` - Reputation API
5. `app/api/reputation/leaderboard/route.ts` - Leaderboard API

### Step 2: Configure Environment Variables

Ensure the following environment variables are set in your deployment platform:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The `SUPABASE_SERVICE_ROLE_KEY` is needed for admin-level operations such as awarding badges.

## Frontend Components Deployment

### Step 1: Deploy UI Components

Ensure the following UI components are deployed:

1. `app/components/ui/tooltip.tsx` - Tooltip component used by badges
2. `app/components/user-badges.tsx` - Component for displaying user badges
3. `app/components/reputation-history.tsx` - Component for displaying reputation history
4. `app/components/reputation-leaderboard.tsx` - Component for displaying the leaderboard

### Step 2: Deploy Page Components

Deploy the following pages:

1. `app/profile/[id]/page.tsx` - User profile page with reputation display
2. `app/leaderboard/page.tsx` - Community leaderboard page

### Step 3: Update Navigation

Ensure the leaderboard and profile pages are accessible from your navigation:

1. Update your main navigation to include a link to the leaderboard:
   ```tsx
   <Link href="/leaderboard" className="nav-link">
     Leaderboard
   </Link>
   ```

2. Add links to user profiles where user information is displayed:
   ```tsx
   <Link href={`/profile/${userId}`} className="user-link">
     View Profile
   </Link>
   ```

## Configuring Initial Badges

### Step 1: Seed Initial Badges

Initial badges should be seeded as part of the database migration, but you can also add them manually:

1. Navigate to the Supabase Dashboard > SQL Editor
2. Execute the following SQL to check if badges were created:
   ```sql
   SELECT * FROM badges;
   ```
3. If no badges are present, execute the badge creation script:
   ```sql
   INSERT INTO badges (name, description, icon, level, points, category, requirements, display_order)
   VALUES
     ('Newcomer', 'Welcome to the community!', 'badge-newcomer.svg', 1, 5, 'membership', '{"action": "join"}', 1),
     ('Group Finder', 'Submitted your first group', 'badge-group-finder.svg', 1, 10, 'contribution', '{"action": "submit_group", "count": 1}', 2),
     -- Add other badges as needed
   ```

### Step 2: Prepare Badge Icons

Ensure that badge icons are available:

1. Place SVG icons for badges in your public directory, e.g., `public/badges/`
2. Alternatively, use emoji or text-based icons in the database

## Post-Deployment Testing

### Step 1: Test Badge Display

1. Navigate to a user profile
2. Verify that user badges are displayed correctly
3. Check tooltip functionality by hovering over badges

### Step 2: Test Reputation Points

1. Perform actions that should award reputation points:
   - Submit a group
   - Write a review
   - Vote on a group
   - Submit a report
2. Verify that points are awarded and visible on the user's profile

### Step 3: Test Leaderboard

1. Navigate to the leaderboard page
2. Verify that users are ranked correctly by reputation
3. Test pagination and sorting functionality

### Step 4: Test Badge Awarding

1. Create a test user
2. Perform actions that should award badges (e.g., submit a group)
3. Verify that badges are awarded correctly

## Integration with Existing Features

After deploying the User Reputation System, integrate it with other features:

1. Add reputation display to group cards to show submitter reputation
2. Include reputation level on reviews to indicate reviewer trustworthiness
3. Update the admin dashboard to show reputation statistics

See the [Feature Integration Guide](./README-feature-integration.md) for detailed integration instructions.

## Troubleshooting

### Common Issues

#### 1. Badges Not Displaying

If badges aren't displaying correctly:

- Check that the badge icons are accessible
- Verify that the `user_badges` table has entries
- Ensure the `UserBadges` component is receiving the correct `userId`

#### 2. Reputation Points Not Updating

If reputation points aren't updating:

- Check the browser console for API errors
- Verify that the reputation award functions are being called
- Check the `reputation_history` table for entries
- Ensure database triggers are functioning correctly

#### 3. Leaderboard Issues

If the leaderboard isn't working correctly:

- Verify that the `reputation_leaderboard` view exists
- Check that users have reputation points assigned
- Look for errors in the browser console or server logs

#### 4. Database Trigger Issues

If database triggers aren't functioning:

- Check that the triggers were created successfully:
  ```sql
  SELECT * FROM pg_trigger WHERE tgname LIKE '%reputation%' OR tgname LIKE '%badge%';
  ```
- Verify that the trigger functions exist:
  ```sql
  SELECT * FROM pg_proc WHERE proname LIKE '%reputation%' OR proname LIKE '%badge%';
  ```

### Getting Support

If you encounter issues that aren't covered in this guide:

1. Check the browser console for error messages
2. Look at the server logs for backend errors
3. Verify that all database objects exist and have the correct structure
4. Refer to the Supabase documentation for database-related issues

## Conclusion

After following this deployment guide, you should have a fully functional User Reputation System and Badges feature. Users can now earn reputation points and badges for their contributions, view their reputation history, and see how they rank on the leaderboard.

For information on how this feature works and how to use it in your code, refer to the [User Reputation System and Badges README](./README-reputation-badges.md). 