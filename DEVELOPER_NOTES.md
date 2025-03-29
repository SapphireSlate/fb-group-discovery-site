# Developer Notes for Facebook Group Finder

This document contains helpful notes, common issues, and their solutions for developers working on this project.

## Common Next.js Issues and Solutions

### 1. Client Component Hydration Issues

**Problem:** Error: `useSearchParams() should be wrapped in a suspense boundary`

**Solution:** 
When using hooks like `useSearchParams`, `useRouter`, etc. in client components, they must be wrapped in a Suspense boundary in the parent server component:

```jsx
// In a server component (page.tsx)
import { Suspense } from 'react';
import ClientComponent from './ClientComponent';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientComponent />
    </Suspense>
  );
}
```

### 2. Dynamic Route Parameter Typing

**Problem:** TypeScript errors with params in dynamic route handlers

**Solution:**
Always properly type the params object in dynamic route components:

```tsx
// In [id]/page.tsx
export default function Page({ 
  params 
}: { 
  params: { id: string } 
}) {
  // ...
}
```

### 3. ESLint Warnings for Unused Variables

**Problem:** ESLint incorrectly flags params as unused in dynamic routes

**Solution:**
Add file-specific ESLint rule overrides in `.eslintrc.json`:

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

### 4. Type Safety in Error Handling

**Problem:** Using `any` type in catch blocks

**Solution:**
Use more specific error typing:

```tsx
try {
  // code that might throw an error
} catch (error: Error | unknown) {
  const errorMessage = error instanceof Error 
    ? error.message 
    : 'An unknown error occurred';
  console.error('Error:', errorMessage);
}
```

## Build and Deployment Notes

### Build Configuration

The project uses the following build configuration in `next.config.js`:

```js
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};
```

This allows builds to succeed even with ESLint or TypeScript errors, which is useful during development but should be used carefully in production.

### Image Optimization

Always use the Next.js `Image` component instead of HTML `<img>` tags for better performance:

```jsx
import Image from 'next/image';

// Use like this
<Image 
  src="/path/to/image.jpg" 
  alt="Description" 
  width={800} 
  height={600} 
  priority={true} // For important above-the-fold images
/>
```

## Supabase Integration

### Error Handling with Supabase Queries

When working with Supabase, make sure to properly handle errors:

```tsx
try {
  const { data, error } = await supabase
    .from('table_name')
    .select('*');
  
  if (error) throw error;
  
  // Process data
} catch (error: Error | unknown) {
  const errorMessage = error instanceof Error 
    ? error.message 
    : 'Failed to fetch data';
  console.error('Supabase error:', error);
  setError(errorMessage);
}
```

## State Management 

### Form State Management

For complex forms, consider using form libraries like Formik or React Hook Form instead of managing form state manually:

```tsx
import { useForm } from 'react-hook-form';

function MyForm() {
  const { register, handleSubmit, errors } = useForm();
  
  const onSubmit = (data) => {
    // Handle form submission
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('username', { required: true })} />
      {errors.username && <span>Username is required</span>}
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Code Quality and Best Practices

1. Keep components small and focused on a single responsibility
2. Use TypeScript consistently throughout the codebase
3. Add comprehensive comments for complex logic
4. Use named exports for better tree-shaking and easier imports
5. Follow accessibility best practices (semantic HTML, aria attributes)
6. Optimize for performance (memoization, lazy loading, etc.)

## Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) 