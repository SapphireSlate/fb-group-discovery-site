'use client';

import dynamic from 'next/dynamic';

// Use dynamic import for the form, allowing ssr: false
const EmailPreferencesForm = dynamic(() => import('./email-preferences-form'), { 
  ssr: false,
  loading: () => <div className="py-10 text-center">Loading form...</div>
});

export default function EmailPreferencesClientPage() {
  return (
    <div className="grid gap-8">
      <EmailPreferencesForm />
    </div>
  );
} 