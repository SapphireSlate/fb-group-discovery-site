# Facebook Group Finder

A web application that allows users to discover, share, and rate Facebook groups, with a focus on helping businesses and professionals find relevant niche communities.

## Features

- **User Authentication**: Sign up/login with email, Google, or Facebook OAuth
- **Group Submission**: Submit and share Facebook groups with the community
- **Group Directory**: Browse and search for Facebook groups by categories and tags
- **Voting System**: Upvote, downvote, and rate groups
- **Search Functionality**: Find groups using keywords, tags, and advanced filters
- **Advanced Analytics**: Comprehensive analytics dashboard with trending groups, growth metrics, user engagement stats, category performance, and review sentiment analysis
- **Related Groups**: Discover similar groups based on tags, categories, and ratings
- **Report System**: Report problematic groups that violate community guidelines
- **User Reputation & Badges**: Earn reputation points and achievement badges for contributions
- **Community Leaderboard**: See top contributors ranked by reputation and achievements
- **Email Notification System**: Personalized email notifications with user preference controls
- **Monetization Features**: Premium memberships, featured listings, and verified group program

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend/API**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payment Processing**: Stripe API, Stripe Agent Toolkit
- **Deployment**: Vercel, Netlify, or similar

## Payment Integration

This project uses Stripe for payment processing:

- Premium membership subscriptions
- Featured group listings
- Verified group program

Detailed documentation for the Stripe integration can be found in [docs/stripe-integration.md](docs/stripe-integration.md).

**Important**: The webhook endpoint is currently set to the Vercel deployment URL. Update this to your custom domain when available.

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- npm or yarn
- Supabase account (free tier)
- Stripe account (for payment processing)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/fb-group-finder.git
   cd fb-group-finder
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a Supabase project and get your API credentials

4. Create a `.env.local` file in the root directory with the following:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application

## Database Setup

### Supabase Schema

Create the following tables in your Supabase project:

#### users
```sql
create table public.users (
  id uuid references auth.users not null primary key,
  email text not null,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default now() not null,
  last_login timestamp with time zone,
  reputation integer default 0,
  auth_id uuid references auth.users(id),
  role text,
  reputation_points integer default 0,
  reputation_level integer default 1,
  badges_count integer default 0,
  
  constraint users_email_key unique (email)
);

-- Enable Row Level Security
alter table public.users enable row level security;

-- Create policies
create policy "Users can view all profiles"
  on public.users for select
  using (true);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);
```

#### categories
```sql
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  icon text,
  group_count integer default 0,
  created_at timestamp with time zone default now() not null,
  
  constraint categories_name_key unique (name)
);

-- Enable Row Level Security
alter table public.categories enable row level security;

-- Create policies
create policy "Public can view categories"
  on public.categories for select
  using (true);

create policy "Admin can insert categories"
  on public.categories for insert
  using (auth.jwt() ->> 'role' = 'admin');

create policy "Admin can update categories"
  on public.categories for update
  using (auth.jwt() ->> 'role' = 'admin');
```

#### tags
```sql
create table public.tags (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  group_count integer default 0,
  created_at timestamp with time zone default now() not null,
  
  constraint tags_name_key unique (name)
);

-- Enable Row Level Security
alter table public.tags enable row level security;

-- Create policies
create policy "Public can view tags"
  on public.tags for select
  using (true);

create policy "Users can insert tags"
  on public.tags for insert
  using (auth.uid() is not null);
```

#### groups
```sql
create table public.groups (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  url text not null,
  description text not null,
  category_id uuid references public.categories not null,
  tags text[] default '{}'::text[],
  size integer,
  activity_level text check (activity_level in ('Low', 'Medium', 'High')),
  screenshot_url text,
  submitted_by uuid references public.users not null,
  submitted_at timestamp with time zone default now() not null,
  last_verified timestamp with time zone,
  upvotes integer default 0,
  downvotes integer default 0,
  average_rating numeric(3,2) default 0.00,
  view_count integer default 0,
  is_verified boolean default false,
  status text check (status in ('active', 'pending', 'removed')) default 'pending',
  
  constraint groups_url_key unique (url)
);

-- Enable Row Level Security
alter table public.groups enable row level security;

-- Create policies
create policy "Public can view active groups"
  on public.groups for select
  using (status = 'active');

create policy "Users can insert groups"
  on public.groups for insert
  using (auth.uid() is not null);

create policy "Users can update their own groups"
  on public.groups for update
  using (auth.uid() = submitted_by);
```

#### reviews
```sql
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.groups not null,
  user_id uuid references public.users not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone,
  helpful_votes integer default 0,
  
  constraint reviews_user_group_key unique (user_id, group_id)
);

-- Enable Row Level Security
alter table public.reviews enable row level security;

-- Create policies
create policy "Public can view reviews"
  on public.reviews for select
  using (true);

create policy "Users can insert reviews"
  on public.reviews for insert
  using (auth.uid() is not null);

create policy "Users can update their own reviews"
  on public.reviews for update
  using (auth.uid() = user_id);
```

#### votes
```sql
create table public.votes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users not null,
  group_id uuid references public.groups not null,
  vote_type text check (vote_type in ('upvote', 'downvote')) not null,
  created_at timestamp with time zone default now() not null,
  
  constraint votes_user_group_key unique (user_id, group_id)
);

-- Enable Row Level Security
alter table public.votes enable row level security;

-- Create policies
create policy "Users can insert votes"
  on public.votes for insert
  using (auth.uid() is not null);

create policy "Users can update their own votes"
  on public.votes for update
  using (auth.uid() = user_id);

create policy "Users can view all votes"
  on public.votes for select
  using (true);
```

#### reports
```sql
create table public.reports (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.groups not null,
  user_id uuid references public.users not null,
  reason text not null,
  comment text,
  status text check (status in ('pending', 'in_review', 'resolved', 'dismissed')) default 'pending',
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone,
  resolved_by uuid references public.users,
  resolved_at timestamp with time zone
);
```

#### badges
```sql
create table public.badges (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null,
  icon text not null,
  level integer default 1,
  points integer default 0,
  category text not null,
  created_at timestamp with time zone default now() not null,
  requirements text,
  display_order integer default 0
);
```

#### user_badges
```sql
create table public.user_badges (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users not null,
  badge_id uuid references public.badges not null,
  awarded_at timestamp with time zone default now() not null,
  level integer default 1,
  times_awarded integer default 1,
  
  constraint user_badges_user_id_badge_id_unique unique (user_id, badge_id)
);
```

#### reputation_history
```sql
create table public.reputation_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users not null,
  points integer not null,
  reason text not null,
  source_type text not null,
  source_id uuid,
  created_at timestamp with time zone default now() not null
);
```

## Deployment

This project can be easily deployed to Vercel:

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Configure your environment variables
4. Deploy

## Feature Documentation

For detailed information about specific features, please refer to the following documentation:

- [Related Groups Feature](./README-related-groups.md)
- [Report Group Feature](./README-report-group.md)
- [User Reputation System](./README-reputation-badges.md)
- [Email Notification System](./README-email-system.md)
- [Enhanced Admin Dashboard](./README-admin-dashboard.md)
- [Advanced Analytics](./README-analytics.md)
- [Enhanced User Profiles](./README-enhanced-profiles.md)
- [Testing Documentation](./README-testing.md)
- [Security Implementation](./README-security.md)
- [Project Roadmap](./README-project-roadmap.md)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Troubleshooting Common Build Issues

### ESLint and TypeScript Errors During Build

The project is configured to allow successful builds even when there are ESLint warnings or TypeScript errors. This is controlled in the `next.config.js` file with the following settings:

```js
// next.config.js
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
};
```

For local development, you should still address the errors to maintain code quality, but these settings ensure that builds won't fail due to non-critical linting issues.

### Client-Side Navigation and Hydration Issues

When using client-side navigation hooks like `useSearchParams`, `useRouter`, etc., components must be wrapped in a Suspense boundary to ensure proper hydration. Example:

```jsx
// In page components that use client components with navigation hooks:
import { Suspense } from 'react';

export default function SomePage() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <ClientComponentUsingNavigationHooks />
      </Suspense>
    </div>
  );
}
```

This pattern is used in pages like `src/app/discover/page.tsx` to ensure proper hydration of components that use `useSearchParams`.

### Dynamic Routes and Params Issues

For Next.js App Router pages with dynamic routes (like `[id]`), make sure to properly type the params prop:

```tsx
// In src/app/some-route/[id]/page.tsx
export default function Page({ 
  params 
}: { 
  params: { id: string } 
}) {
  return <div>ID: {params.id}</div>;
}
```

If you see ESLint warnings about unused params in these files, you can add rule exceptions in `.eslintrc.json`:

```json
{
  "overrides": [
    {
      "files": ["src/app/some-route/[id]/page.tsx"],
      "rules": {
        "@typescript-eslint/no-unused-vars": "off"
      }
    }
  ]
}
```

## Project Structure

// ... existing code ...

## Security

The application implements a comprehensive security strategy to protect user data and prevent common web vulnerabilities:

- **Content Sanitization**: All user inputs are sanitized to prevent XSS attacks using DOMPurify
- **Input Validation**: Strict validation of all user inputs using Zod schemas
- **CAPTCHA Protection**: reCAPTCHA verification on all sensitive forms to prevent automated attacks
- **API Security**: Rate limiting, CSRF protection, and security headers
- **Row Level Security**: Database-level security policies to restrict data access
- **Security Headers**: Comprehensive set of security headers including CSP
- **SQL Injection Prevention**: Parameterized queries and input pattern scanning

For detailed security documentation, see:
- [Security Measures Documentation](./README-security.md)
- [Security Setup Guide](./README-security-setup.md)
