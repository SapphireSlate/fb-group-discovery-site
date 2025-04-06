# User Reputation System and Badges

This document outlines the implementation of the User Reputation System and Badges feature for FB Group Discovery site.

## Overview

The User Reputation System and Badges feature enhances user engagement by rewarding contributions to the platform. Users earn reputation points for various actions and can earn badges based on their achievements and contributions.

## Key Components

The feature consists of the following components:

1. **Database Schema**: Tables and views for storing reputation data, badges, and user achievements
2. **Utility Functions**: Helper functions for awarding points and badges
3. **API Endpoints**: Endpoints for fetching reputation data, badge information, and user badges
4. **UI Components**: Components for displaying reputation information and badges
5. **Profile Pages**: User profile pages that show reputation and badges

## Database Schema

### New Tables

- **badges**: Stores badge definitions, requirements, and metadata
- **user_badges**: Tracks which badges users have earned
- **reputation_history**: Records reputation point transactions and their sources

### Views

- **reputation_leaderboard**: Shows users ranked by reputation with contribution stats

### Schema Updates

The `users` table has been updated with the following fields:

- **reputation_points**: Total reputation points earned
- **reputation_level**: Current reputation level (0-5)
- **badges_count**: Number of unique badges earned

## Reputation Points System

Users earn reputation points for the following activities:

| Action | Points |
|--------|--------|
| Group Submission | 15 |
| Write a Review | 10 |
| Receive an Upvote | 2 |
| Receive a Downvote | -1 |
| Submit a Report | 5 |
| Report Accepted | 10 |
| Report Rejected | -5 |
| Complete Profile | 5 |
| Earn a Badge | Varies by badge |

## Reputation Levels

Users progress through reputation levels as they earn points:

| Level | Name | Points Required |
|-------|------|----------------|
| 0 | Newcomer | 0 |
| 1 | Contributor | 100 |
| 2 | Regular | 500 |
| 3 | Expert | 1,000 |
| 4 | Authority | 5,000 |
| 5 | Legend | 10,000 |

## Badge System

Badges are awarded for specific achievements and milestones. They fall into the following categories:

- **Contribution**: Based on the number and quality of contributions
- **Reputation**: Based on reaching reputation milestones
- **Special**: Special achievements or admin-awarded badges

## Implementation Files

### Database

- `supabase/migrations/20250404_001_badges.sql`: Creates the badges and user_badges tables
- `supabase/migrations/20250405_001_reputation.sql`: Creates the reputation_history table and updates the users table
- `supabase/migrations/20250406_003_reputation_views.sql`: Creates the reputation leaderboard view and DB triggers

### API

- `app/api/badges/route.ts`: API for managing badges
- `app/api/user-badges/route.ts`: API for managing user badges
- `app/api/reputation/route.ts`: API for reputation history
- `app/api/reputation/leaderboard/route.ts`: API for reputation leaderboard

### Utilities

- `lib/reputation.ts`: Utility functions for awarding reputation points and badges

### UI Components

- `app/components/user-badges.tsx`: Component for displaying user badges
- `app/components/reputation-history.tsx`: Component for displaying reputation history
- `app/components/reputation-leaderboard.tsx`: Component for displaying the leaderboard

### Pages

- `app/profile/[id]/page.tsx`: User profile page with reputation and badges
- `app/leaderboard/page.tsx`: Community reputation leaderboard page

## How to Use

### Awarding Reputation Points

To award reputation points to a user, use the `awardReputationPoints` function:

```typescript
import { awardReputationPoints } from '@/lib/reputation';

await awardReputationPoints({
  userId: "user-id-here",
  points: 10,
  reason: "Submitted a high-quality review",
  sourceType: "review",
  sourceId: "review-id-here" // optional
});
```

### Checking for Badges

After certain user actions, check if they qualify for badges:

```typescript
import { checkContributionBadges } from '@/lib/reputation';

// After a user submits a group
await checkContributionBadges(userId, 'submit_group');

// After a user writes a review
await checkContributionBadges(userId, 'write_review');
```

### Displaying Badges on a Profile

To display a user's badges, use the `UserBadges` component:

```tsx
import UserBadges from '@/app/components/user-badges';

<UserBadges userId={user.id} limit={6} />
```

### Displaying Reputation History

To display a user's reputation history, use the `ReputationHistory` component:

```tsx
import ReputationHistory from '@/app/components/reputation-history';

<ReputationHistory userId={user.id} limit={10} />
```

## Deployment Instructions

1. **Run Database Migrations**: Deploy the SQL migration files in the specified order
2. **Deploy API Changes**: Update the API endpoints
3. **Deploy UI Components**: Update the UI components and pages
4. **Seed Initial Badges**: Create initial badges through the admin interface or database

## Testing

1. **Test Reputation Points**: Perform actions that should award points and verify they are recorded
2. **Test Badge Awarding**: Verify that badges are awarded correctly
3. **Test Leaderboard**: Verify the leaderboard shows users in the correct order

## Future Enhancements

1. **Badge Notifications**: Notify users when they earn a badge
2. **Reputation Bonuses**: Time-limited reputation bonuses for special events
3. **Achievement Milestones**: Unlock features or privileges at certain reputation levels
4. **Social Sharing**: Allow users to share their badges on social media 