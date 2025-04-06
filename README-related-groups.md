# Related Groups Feature

This feature enhances the group detail page by showing groups that are related to the current group based on:

1. Shared tags (highest weight)
2. Same category (medium weight)
3. Similar rating range (lowest weight)

## Implementation Details

The implementation consists of:

1. A SQL function `get_related_groups` that finds and scores related groups
2. A new API endpoint at `/api/groups/[id]/related` that fetches related groups
3. A React component `RelatedGroups` that displays the related groups
4. Integration with the group detail page

## Deployment Instructions

### 1. Deploy the SQL Function

You need to deploy the SQL function to your Supabase database. There are two ways to do this:

#### Option 1: Using the Deployment Script

1. Make sure you have the environment variables set up:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (admin access)

2. Run the deployment script:
   ```bash
   node scripts/deploy-related-groups.js
   ```

#### Option 2: Using Supabase Migrations

1. If you're using Supabase CLI for migrations:
   ```bash
   supabase migration up
   ```

2. Or manually run the SQL from the Supabase SQL Editor:
   - Open `supabase/migrations/20250404_001_related_groups.sql`
   - Copy the content
   - Paste it into the Supabase SQL Editor and run

### 2. Deploy the API and Frontend

1. Deploy the API endpoint:
   - Ensure `app/api/groups/[id]/related/route.ts` is committed and pushed to your repository

2. Deploy the frontend components:
   - Ensure `app/group/[id]/related-groups.tsx` is committed and pushed
   - Ensure the updated `app/group/[id]/page.tsx` is committed and pushed

3. Deploy your Next.js application as usual:
   ```bash
   npx vercel deploy --prod
   ```

## Testing the Feature

After deployment, you can test the feature:

1. Navigate to any group detail page
2. Click on the "Related Groups" tab
3. You should see a list of related groups based on shared tags, category, and rating
4. If no related groups are found, a "No related groups found" message will be displayed

## Troubleshooting

If you encounter issues:

1. Check the browser console for any errors
2. Verify that the SQL function was successfully deployed using:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'get_related_groups';
   ```
3. Test the API endpoint directly in the browser: `/api/groups/[GROUP_ID]/related`
4. Check that your group has tags and a category assigned (if not, the relatedness algorithm won't have much to work with)

## Future Enhancements

Potential improvements to consider:

1. Add pagination support for related groups
2. Implement caching to improve performance
3. Add more sophisticated relatedness algorithms (e.g., user behavior-based recommendations)
4. Allow users to filter related groups by specific criteria 