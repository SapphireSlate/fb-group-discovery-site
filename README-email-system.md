# Email Notification System

The Email Notification System enables personalized communication with users via email, enhancing engagement and providing important updates about platform activities. Users can customize their email preferences to receive only the notifications they want.

## Key Components

### 1. Database Schema
- **Table Name**: `email_preferences`
- **Purpose**: Stores user email notification preferences

**Schema**:
```sql
CREATE TABLE email_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  welcome_email BOOLEAN NOT NULL DEFAULT TRUE,
  group_approved BOOLEAN NOT NULL DEFAULT TRUE,
  new_review BOOLEAN NOT NULL DEFAULT TRUE,
  reputation_milestone BOOLEAN NOT NULL DEFAULT TRUE,
  new_badge BOOLEAN NOT NULL DEFAULT TRUE,
  new_report BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id)
);
```

### 2. Email Types
Users can opt in or out of the following email types:

| Email Type | Description | Default |
|------------|-------------|---------|
| Welcome Email | Sent when a user first registers | Enabled |
| Group Approved | Notification when a user's submitted group is approved | Enabled |
| New Review | Notification when someone leaves a review on user's group | Enabled |
| Reputation Milestone | Notification when user reaches a new reputation level | Enabled |
| New Badge | Notification when user earns a new badge | Enabled |
| New Report | Notification for admins when a group is reported | Enabled |

### 3. Implementation Files

#### Backend
- **Email Utility**: `lib/email.ts` - Core email functionality including templates and sending logic
- **Database Migration**: `supabase/migrations/20250407_001_email_preferences.sql` - Creates the email_preferences table
- **API Endpoint**: `app/api/user/email-preferences/route.ts` - GET and PUT handlers for managing preferences

#### Frontend
- **Settings Page**: `app/settings/page.tsx` - Main settings page with email preferences link
- **Email Preferences Page**: `app/settings/email-preferences/page.tsx` - Page container for email settings
- **Email Preferences Form**: `app/settings/email-preferences/email-preferences-form.tsx` - Client-side form for managing preferences

## How To Send Emails

To send an email with preference checking:

```typescript
import { sendEmailWithPreferenceCheck } from '@/lib/email';

// Example: Send a welcome email
await sendEmailWithPreferenceCheck(
  'user@example.com',           // User's email address
  'user-uuid',                  // User's ID
  'welcomeEmail',               // Email preference type
  getWelcomeEmailTemplate,      // Template function
  ['John Doe']                  // Template arguments (username)
);
```

To send an email without checking preferences (for critical notifications):

```typescript
import { sendEmail, getWelcomeEmailTemplate } from '@/lib/email';

const emailTemplate = getWelcomeEmailTemplate('John Doe');
emailTemplate.to = 'user@example.com';
await sendEmail(emailTemplate);
```

## Integration Points

The Email Notification System is integrated with several features:

1. **User Registration**: Sends a welcome email
2. **Group Approval**: Notifies group creator when their group is approved
3. **Group Reviews**: Notifies group owner when a new review is posted
4. **Reputation System**: Alerts users when they reach reputation milestones
5. **Badge System**: Notifies users when they earn new badges
6. **Report System**: Alerts admins about new group reports

## Configuration

Email configuration is set via environment variables:

```
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your_email_user
EMAIL_SERVER_PASSWORD=your_email_password
EMAIL_FROM=noreply@example.com
```

For local development, you can use services like [Ethereal](https://ethereal.email/) or [Mailtrap](https://mailtrap.io/).

## Deployment

1. Create the required environment variables in your hosting provider
2. Run the database migration to create the email_preferences table
3. Deploy the application with the latest code

## Testing

To test the Email Notification System:

1. Set up test SMTP credentials in your environment
2. Create test users with different email preferences
3. Trigger actions that would send emails (e.g., creating a group)
4. Verify that emails are sent according to preferences

## Future Enhancements

- **Email Templates**: Expand the variety of email templates with more personalization
- **Digest Emails**: Weekly or monthly digests of platform activity
- **HTML Editor**: Admin interface for editing email templates without code changes
- **Email Analytics**: Track open rates and engagement with sent emails

## Troubleshooting

Common issues and solutions:

- **Emails not sending**: Check SMTP credentials and server connectivity
- **Missing preferences**: Verify the email_preferences record exists for the user
- **Template errors**: Ensure all required template variables are provided

For support, contact the development team. 