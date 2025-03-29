'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowser } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { Database } from '@/lib/database.types';

type Group = Database['public']['Tables']['groups']['Row'];

export default function SubmitSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const groupId = searchParams.get('id');
  const [group, setGroup] = useState<Group | null>(null);
  
  useEffect(() => {
    async function fetchGroup() {
      if (!groupId) {
        router.push('/submit');
        return;
      }
      
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();
      
      if (error || !data) {
        router.push('/submit');
        return;
      }
      
      setGroup(data);
    }
    
    fetchGroup();
  }, [groupId, router]);
  
  if (!group) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <p className="text-center">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-center">Group Submitted Successfully!</CardTitle>
          <CardDescription className="text-center">
            Thank you for contributing to our Facebook Group directory
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-lg">{group.name}</h3>
            <p className="text-gray-500 text-sm mt-1">
              Status: <span className="text-amber-600 font-medium">Pending Review</span>
            </p>
          </div>
          
          <div className="space-y-2">
            <p>What happens next:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Our team will review your submission</li>
              <li>Once approved, your group will be visible in our directory</li>
              <li>You'll be notified when the review process is complete</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Link href="/">
            <Button variant="outline">Return to Home</Button>
          </Link>
          <Link href="/submit">
            <Button>Submit Another Group</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
} 