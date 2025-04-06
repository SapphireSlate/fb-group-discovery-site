# Advanced Analytics Documentation

## Overview

The Facebook Group Discovery platform includes a comprehensive analytics system that provides insights into group performance, user engagement, category popularity, and more. This document describes the analytics features, database views/functions, API endpoints, and user interface components.

> **Implementation Status**: ✅ COMPLETED

## Database Schema

The analytics system is built on several database views and functions that aggregate and process data from the main application tables:

### Database Views

1. **group_growth_analytics**
   - Tracks group metrics over time
   - Aggregates daily group submissions, views, ratings, and votes
   - Includes verification status statistics

2. **category_analytics**
   - Provides metrics on category performance
   - Includes group count, views, average ratings, upvotes/downvotes
   - Tracks unique contributors and verified groups per category

3. **user_engagement_analytics**
   - Tracks user engagement metrics over time
   - Includes new user signups, group submissions, review activity
   - Calculates engagement metrics like reviews per user and votes per user

4. **tag_analytics**
   - Analysis of tag popularity and performance
   - Includes group count, views, average ratings for each tag
   - Calculates average net votes (upvotes minus downvotes) per tag

5. **review_analytics**
   - Tracks review activity and sentiment over time
   - Aggregates review counts, average ratings, positive/negative reviews
   - Calculates positive review percentage for sentiment analysis

### Database Functions

1. **get_platform_analytics(p_days_back INTEGER)**
   - Returns key platform metrics for specified time period
   - Includes total users, total groups, total reviews, average rating, active users
   - Calculates change percentage compared to previous period

2. **get_trending_groups(p_days_back INTEGER, p_limit INTEGER)**
   - Identifies trending groups based on recent activity
   - Uses a weighted calculation based on views, votes, and reviews
   - Compares current period to previous period to identify growth

## API Endpoints

The analytics data is accessible through a set of API endpoints:

### Main Analytics Endpoint

`GET /api/analytics?type=[type]&days=[days]&limit=[limit]`

Parameters:
- `type`: Type of analytics to retrieve (required)
- `days`: Number of days to look back (default: 30)
- `limit`: Maximum number of records to return (default: 10)

Available types:
- `platform`: Platform-wide overview metrics
- `trending`: Trending groups
- `growth`: Group growth analytics over time
- `categories`: Category performance metrics
- `tags`: Tag analytics
- `user-engagement`: User engagement metrics over time
- `reviews`: Review analytics and sentiment analysis

Example response for `type=platform`:
```json
{
  "success": true,
  "data": [
    {
      "metric": "total_users",
      "value": 1250,
      "change_percentage": 8.5
    },
    {
      "metric": "total_groups",
      "value": 452,
      "change_percentage": 12.3
    },
    ...
  ]
}
```

### Verification Analytics Endpoint

`GET /api/analytics/verification`

Returns statistics about group verifications, including:
- Total verified groups
- Verification rates
- Verification status distribution

## User Interface

The analytics data is visualized through several components in the admin dashboard:

### Admin Analytics Dashboard

Located at `/admin/analytics`, the dashboard includes:

1. **Platform Overview**
   - Key metrics with change indicators
   - Visual representation of platform health

2. **Trending Groups Component**
   - Table of top performing groups based on recent activity
   - Growth metrics for views, votes, and reviews
   - Trend score calculation showing relative performance
   - Period selection (7, 30, 90 days) for different time frames
   - Implemented in `app/admin/analytics/components/trending-groups.tsx`

3. **Group Growth Charts**
   - Time-series visualization of group submissions, views, and ratings
   - Tabbed interface showing submissions, engagement, and verification metrics
   - Interactive charts using Recharts library
   - Period selection for different time ranges
   - Implemented in `app/admin/analytics/components/group-growth-chart.tsx`

4. **Category Analytics**
   - Distribution of groups across categories (pie chart)
   - Performance comparison between categories (bar charts)
   - Detailed metrics table with sortable columns
   - Visualizations for group counts, views, ratings, and engagement metrics
   - Implemented in `app/admin/analytics/components/category-analytics.tsx`

5. **User Engagement Charts**
   - User growth visualization over time
   - Activity metrics tracking (groups, reviews, votes)
   - Engagement per user analysis with key metrics
   - Responsive charts that adapt to different screen sizes
   - Implemented in `app/admin/analytics/components/user-engagement-chart.tsx`

6. **Review Analytics**
   - Sentiment analysis visualization (positive, neutral, negative)
   - Review volume trends across different time periods
   - Rating distribution and trends
   - Detailed metrics summary with percentage calculations
   - Implemented in `app/admin/analytics/components/review-analytics.tsx`

## Accessing Analytics

### For Administrators

1. Navigate to the admin panel by clicking on your profile icon and selecting "Admin Dashboard"
2. Select "Analytics" from the left sidebar
3. Use the tabs to navigate between different analytics views
4. Adjust the time period using the dropdown in the top right corner

### API Access

Developers can access analytics data programmatically using the API endpoints described above. Authentication is required.

Example API call:
```javascript
const response = await fetch('/api/analytics?type=platform&days=30', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});
const data = await response.json();
```

## Best Practices

1. **Performance Considerations**
   - Analytics queries can be resource-intensive; use caching where appropriate
   - Limit time ranges for large datasets
   - Consider implementing scheduled aggregations for historical data

2. **Interpreting Data**
   - Compare trends over time rather than focusing on absolute numbers
   - Look for correlations between different metrics
   - Consider external factors that might influence metrics

3. **Data Privacy**
   - Analytics data is aggregated and does not expose individual user information
   - Ensure compliance with privacy regulations when extending analytics features

## Technical Implementation

The analytics system is implemented using:
- SQL views and functions in the Supabase database
- Next.js API routes for the backend
- React and Recharts for the frontend visualization
- Client-side data fetching with appropriate loading states and error handling

### Implemented Components

All analytics components follow a consistent pattern:
- Client-side data fetching using React's useEffect hook
- Loading state management with skeleton placeholders
- Error handling with user-friendly error messages
- Responsive design that adapts to different screen sizes
- Custom color schemes for different metrics

### Data Flow

1. Client component requests data from API endpoint
2. API route processes request parameters (type, period, limit)
3. API calls appropriate database function or view
4. Data is transformed and returned in JSON format
5. Component renders data using Recharts visualizations

## Extending Analytics

To add new analytics features:

1. Create appropriate database views or functions in the Supabase migrations
2. Add the analytics type to the API endpoint switch statement
3. Create a new React component to visualize the data
4. Add the component to the analytics dashboard

## Troubleshooting

Common issues and solutions:

1. **Slow analytics queries**
   - Reduce the date range
   - Add appropriate indexes to database tables
   - Implement query optimization techniques

2. **Missing or incomplete data**
   - Verify that data is being properly recorded in source tables
   - Check for any errors in the analytics views or functions
   - Ensure database migrations have been properly applied

3. **Visualization issues**
   - Check browser console for JavaScript errors
   - Verify that data is being properly formatted for charts
   - Test with smaller datasets to isolate issues 