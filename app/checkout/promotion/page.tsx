'use client'

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function PromotionCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const type = searchParams.get('type');
  const days = searchParams.get('days');
  
  useEffect(() => {
    // Redirect to the main checkout page with promotion parameters
    if (type && days) {
      router.push(`/checkout?type=${type}&days=${days}`);
    } else {
      router.push('/promote');
    }
  }, [router, type, days]);
  
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
} 