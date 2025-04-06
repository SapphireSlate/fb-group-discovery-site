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

# Security Implementation

## CAPTCHA Protection

We've implemented reCAPTCHA protection on all sensitive forms in the application. When building new forms that handle sensitive operations, make sure to:

1. Import the reusable CAPTCHA component:
   ```tsx
   import { Recaptcha } from '@/components/ui/recaptcha';
   ```

2. Add state management for the CAPTCHA token:
   ```tsx
   const [captchaToken, setCaptchaToken] = useState<string | null>(null);
   const [captchaError, setCaptchaError] = useState<string | null>(null);
   ```

3. Add the Recaptcha component to your form:
   ```tsx
   <Recaptcha 
     onChange={setCaptchaToken}
     errorMessage={captchaError}
     resetOnError={true}
   />
   ```

4. Validate the token before submitting:
   ```tsx
   if (!captchaToken) {
     setCaptchaError('Please complete the CAPTCHA verification');
     return;
   }
   ```

5. When creating a new API endpoint, always verify CAPTCHA tokens server-side using:
   ```tsx
   import { verifyRecaptcha } from '@/lib/security';
   
   // In your API route
   const isCaptchaValid = await verifyRecaptcha(recaptchaToken);
   if (!isCaptchaValid) {
     return NextResponse.json(
       { message: 'CAPTCHA verification failed' },
       { status: 400 }
     );
   }
   ```

## Input Validation and Sanitization

The application uses Zod schemas for validation and DOMPurify for sanitization. Always:

1. Define validation schemas in `lib/validation.ts`:
   ```typescript
   export const myFormSchema = z.object({
     field1: textInputSchema({ min: 3, max: 100 }),
     field2: z.boolean(),
     recaptchaToken: captchaSchema
   });
   ```

2. Sanitize user inputs using the utility functions:
   ```typescript
   import { sanitizeInput, sanitizeHtml } from '@/lib/utils';
   
   // For regular text inputs
   const safeText = sanitizeInput(userInput);
   
   // For HTML content (if allowed)
   const safeHtml = sanitizeHtml(userHtmlContent);
   ```

3. Check for SQL injection patterns:
   ```typescript
   import { hasSqlInjectionPatterns } from '@/lib/utils';
   
   if (hasSqlInjectionPatterns(userInput)) {
     return errorResponse('Invalid input');
   }
   ```

## API Security

When creating new API endpoints, always:

1. Apply the standard security checks using:
   ```typescript
   import { applyApiSecurity } from '@/lib/security';
   
   export async function POST(request: Request) {
     const securityResponse = await applyApiSecurity(request, {
       rateLimit: 60,             // Optional: Custom rate limit
       requireAuth: true,         // Optional: Require authentication
       checkSqlInjection: true    // Optional: Check for SQL injection
     });
     
     if (securityResponse) return securityResponse;
     
     // Your API logic here
   }
   ```

2. Structure your API response using standard formats:
   ```typescript
   return NextResponse.json(
     { success: true, data: result },
     { status: 200 }
   );
   ```

For detailed security documentation, refer to `README-security.md` and `README-security-setup.md`. 