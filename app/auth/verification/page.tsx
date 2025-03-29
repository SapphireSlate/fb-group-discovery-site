'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckIcon } from 'lucide-react';

export default function VerificationPage() {
  return (
    <div className="container mx-auto max-w-md py-12">
      <Card>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Check Your Email</CardTitle>
          <CardDescription className="text-center">
            We've sent you a verification link to verify your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Please check your inbox and click the verification link to activate your account.
          </p>
          <p className="text-gray-600">
            If you don't see the email, check your spam folder. The email comes from no-reply@supabase.co.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Link href="/auth/login" className="w-full">
            <Button variant="outline" className="w-full">
              Back to Login
            </Button>
          </Link>
          <div className="text-sm text-center text-gray-600">
            Didn't receive an email?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Try logging in again
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 