# Report Group Feature Implementation

This document provides an overview of the Report Group feature, its implementation, and instructions for deployment and testing.

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Implementation Details](#implementation-details)
3. [Deployment Instructions](#deployment-instructions)
4. [Testing](#testing)
5. [Troubleshooting](#troubleshooting)
6. [Future Enhancements](#future-enhancements)

## Feature Overview

The Report Group feature allows users to report Facebook groups that may violate guidelines or have issues. Key capabilities include:

- Users can report groups with a specific reason and optional comment
- Reports are stored in a database and can be managed by administrators
- Admin dashboard for managing reports with filtering and pagination
- Ability to change report status (pending, in review, resolved, dismissed)
- Email notifications for admins when new reports are submitted (future enhancement)

## Implementation Details

### Database

- Created a `reports` table with necessary fields:
  - id, group_id, user_id, reason, comment, status, etc.
  - Row Level Security policies to control access
- Added a `report_counts` view for easy aggregation of report counts by status
- Updated the `users` table to include a `role` field for admin privileges

### API Endpoints

- `/api/reports` - POST endpoint for submitting reports
- `/api/reports` - GET endpoint for listing reports (admin only)
- `/api/reports/[id]` - GET, PATCH, DELETE endpoints for managing individual reports

### Frontend Components

- Modal component for submitting reports (`ReportGroupModal`)
- Client-side component for triggering the modal (`ReportButtonClient`)
- Admin dashboard for viewing and managing reports (`app/admin/reports`)
- Actions component for updating report status (`ReportActionButtons`)

## Deployment Instructions

### 1. Database Migration

You need to deploy the database migration to create the reports table and view.

#### Option 1: Use Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Log in to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Push the migration
supabase db push
```

#### Option 2: Manual SQL Execution

1. Navigate to Supabase Dashboard > SQL Editor
2. Copy the contents of `supabase/migrations/20250404_002_reports.sql`
3. Execute the SQL in the Supabase SQL Editor

### 2. Update Database Types

Ensure your database types are updated to include the new tables and views:

1. Update `lib/database.types.ts` to include the `reports` table and `report_counts` view
2. Add `role` field to the `users` table type definition

### 3. Deploy API Endpoints

These files should be included in your deployment:

- `app/api/reports/route.ts` - Main reports API
- `app/api/reports/[id]/route.ts` - Individual report API

### 4. Deploy Frontend Components

Deploy the frontend components:

- `app/components/report-group-modal.tsx`
- `app/group/[id]/report-button-client.tsx`
- `app/admin/reports/page.tsx`
- `app/admin/reports/report-action-buttons.tsx`
- Updated `app/admin/page.tsx` with link to reports management

### 5. Update User Permissions

For existing users who should have admin privileges:

1. Go to Supabase Dashboard > Table Editor > users
2. Find the users who should be admins
3. Set their `role` field to 'admin'

Or alternatively, use SQL:

```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'admin@example.com';
```

## Testing

### Testing Report Submission

1. Sign in to your application with a regular user account
2. Navigate to any group details page
3. Click the "Report Group" button in the sidebar
4. Select a reason and optionally add a comment
5. Submit the report
6. Verify a success message is displayed

### Testing Admin Dashboard

1. Sign in with an admin account
2. Navigate to the admin dashboard
3. Click on "Manage Reports"
4. Verify you can see a list of reports
5. Try filtering by status
6. Try changing the status of a report
7. Verify the list refreshes with the updated status

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**:
   - Check that Row Level Security policies are correctly applied
   - Verify the user has the appropriate role

2. **Missing Reports in Admin Dashboard**:
   - Verify the user is properly identified as an admin
   - Check that the reports are being fetched with the correct filters

3. **Error Submitting Reports**:
   - Check for validation errors in the form
   - Verify the API endpoint is correctly handling the request
   - Look for errors in the browser console

## Future Enhancements

1. Email notifications for admins when new reports are submitted
2. Batch actions for handling multiple reports at once
3. Advanced filtering and search capabilities
4. Integration with content moderation tools
5. User feedback when their report status changes 