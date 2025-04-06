# Monetization Implementation

## Implementation Plan

This document outlines the technical implementation details for monetization features in the Facebook Group Discovery platform.

## 1. Stripe Integration

### Step 1: Install Dependencies
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js stripe
```

### Step 2: Set Up Environment Variables
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Step 3: Create Stripe Provider Component
```tsx
// app/providers/StripeProvider.tsx
'use client'

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ReactNode } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function StripeProvider({ children }: { children: ReactNode }) {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}
```

## 2. Database Schema Updates

### Subscriptions Table
```sql
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX subscriptions_user_id_idx ON public.subscriptions(user_id);
CREATE INDEX subscriptions_status_idx ON public.subscriptions(status);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions" 
  ON public.subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admin users can view all subscriptions" 
  ON public.subscriptions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );
```

### Featured Listings Table
```sql
CREATE TABLE public.featured_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  promotion_type TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  amount_paid NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX featured_listings_group_id_idx ON public.featured_listings(group_id);
CREATE INDEX featured_listings_status_idx ON public.featured_listings(status);
CREATE INDEX featured_listings_date_idx ON public.featured_listings(end_date);

ALTER TABLE public.featured_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Featured listings are viewable by everyone" 
  ON public.featured_listings FOR SELECT 
  USING (true);
```

### Payment History Table
```sql
CREATE TABLE public.payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  payment_method TEXT,
  status TEXT NOT NULL,
  type TEXT NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX payment_history_user_id_idx ON public.payment_history(user_id);
CREATE INDEX payment_history_type_idx ON public.payment_history(type);

ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment history" 
  ON public.payment_history FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admin users can view all payment history" 
  ON public.payment_history FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );
```

## 3. API Endpoints

### Subscription Management
```typescript
// app/api/subscriptions/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function GET(request: Request) {
  const supabase = createClient();
  
  // Get user from session
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Get user subscriptions
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = createClient();
  
  // Get user from session
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { plan_id, payment_method_id } = body;
    
    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('email, stripe_customer_id')
      .eq('id', user.id)
      .single();
      
    // Create or get Stripe customer
    let customerId = profile?.stripe_customer_id;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email || user.email,
        payment_method: payment_method_id,
        invoice_settings: {
          default_payment_method: payment_method_id,
        }
      });
      
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }
    
    // Determine price ID based on plan
    let priceId;
    switch (plan_id) {
      case 'premium':
        priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
        break;
      case 'professional':
        priceId = process.env.STRIPE_PROFESSIONAL_PRICE_ID;
        break;
      default:
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }
    
    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
    
    // Store subscription in database
    await supabase.from('subscriptions').insert({
      user_id: user.id,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      plan_id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    });
    
    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as any).payment_intent.client_secret,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Featured Listings
```typescript
// app/api/featured-listings/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get('groupId');
  
  const supabase = createClient();
  
  let query = supabase
    .from('featured_listings')
    .select('*')
    .eq('status', 'active')
    .lt('start_date', new Date().toISOString())
    .gt('end_date', new Date().toISOString());
    
  if (groupId) {
    query = query.eq('group_id', groupId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = createClient();
  
  // Get user from session
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { group_id, promotion_type, duration_days } = body;
    
    // Verify group ownership
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('id', group_id)
      .single();
      
    if (groupError || !group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    
    if (group.submitted_by !== user.id) {
      return NextResponse.json({ error: 'Not authorized to promote this group' }, { status: 403 });
    }
    
    // Calculate pricing based on promotion type and duration
    let amount = 0;
    switch (promotion_type) {
      case 'featured':
        amount = 15.00 * (duration_days / 7);
        break;
      case 'category_spotlight':
        amount = 12.00 * (duration_days / 7);
        break;
      case 'enhanced_listing':
        amount = 19.99 * (duration_days / 30);
        break;
      case 'bundle':
        amount = 29.99 * (duration_days / 7);
        break;
      default:
        return NextResponse.json({ error: 'Invalid promotion type' }, { status: 400 });
    }
    
    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration_days);
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert to cents
      currency: 'usd',
      metadata: {
        group_id,
        user_id: user.id,
        promotion_type,
        duration_days,
      },
    });
    
    // Return client secret for frontend to complete payment
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

## 4. Frontend Components

### Pricing Page
```tsx
// app/pricing/page.tsx
'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircleIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';

export default function PricingPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
  const handleSelectPlan = (planId: string) => {
    if (!user) {
      router.push(`/auth/login?redirect=/pricing&plan=${planId}`);
      return;
    }
    
    setSelectedPlan(planId);
    router.push(`/checkout?plan=${planId}`);
  };
  
  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold">Choose Your Plan</h1>
          <p className="text-muted-foreground mt-2">
            Select the plan that best fits your needs to discover and connect with the perfect Facebook groups.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Basic Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Basic</CardTitle>
              <CardDescription>For casual browsers</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">Free</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircleIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>Standard group discovery</span>
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>Basic search filters</span>
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>Vote and review groups</span>
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>Personal profile</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => handleSelectPlan('basic')}>
                Get Started
              </Button>
            </CardFooter>
          </Card>
          
          {/* Premium Plan */}
          <Card className="border-primary">
            <CardHeader className="bg-primary/5">
              <div className="text-center mb-2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs">
                  POPULAR
                </span>
              </div>
              <CardTitle>Premium</CardTitle>
              <CardDescription>For avid community members</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">$5.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircleIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>All Basic features</span>
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>Advanced search filters</span>
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>Ad-free experience</span>
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>Early access to new groups</span>
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>Premium user badge</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handleSelectPlan('premium')}>
                Subscribe Now
              </Button>
            </CardFooter>
          </Card>
          
          {/* Professional Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Professional</CardTitle>
              <CardDescription>For business networkers</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">$9.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircleIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>All Premium features</span>
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>Personal analytics dashboard</span>
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>API access</span>
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>Priority customer support</span>
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="mr-2 h-5 w-5 text-green-500" />
                  <span>Dedicated account manager</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => handleSelectPlan('professional')}>
                Subscribe Now
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="mt-10 text-center">
          <h2 className="text-xl font-bold mb-4">Group Owner?</h2>
          <p className="text-muted-foreground mb-4">
            Promote your group with our featured listings and increase your group's visibility.
          </p>
          <Button variant="outline" onClick={() => router.push('/promote')}>
            Promote Your Group
          </Button>
        </div>
      </div>
    </div>
  );
} 
```

## 5. Subscription Cancellation

### API Endpoint
```typescript
// app/api/subscriptions/[id]/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  
  // Get user from session
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const subscriptionId = params.id;
  
  // Verify subscription belongs to user
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', subscriptionId)
    .eq('user_id', user.id)
    .single();
    
  if (error || !subscription) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
  }
  
  try {
    const body = await request.json();
    const { action } = body;
    
    if (action === 'cancel_at_period_end') {
      // Update Stripe subscription to cancel at period end
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true,
      });
      
      // Update subscription in database
      await supabase
        .from('subscriptions')
        .update({ cancel_at_period_end: true })
        .eq('id', subscriptionId);
        
      return NextResponse.json({ 
        message: 'Subscription will be canceled at the end of the billing period' 
      });
    } else if (action === 'reactivate') {
      // Update Stripe subscription to not cancel
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: false,
      });
      
      // Update subscription in database
      await supabase
        .from('subscriptions')
        .update({ cancel_at_period_end: false })
        .eq('id', subscriptionId);
        
      return NextResponse.json({ message: 'Subscription reactivated' });
    } else if (action === 'change_plan') {
      const { new_plan_id } = body;
      
      // Determine price ID based on plan
      let priceId;
      switch (new_plan_id) {
        case 'premium':
          priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
          break;
        case 'professional':
          priceId = process.env.STRIPE_PROFESSIONAL_PRICE_ID;
          break;
        default:
          return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
      }
      
      // Update Stripe subscription
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        items: [{
          id: (await stripe.subscriptions.retrieve(subscription.stripe_subscription_id)).items.data[0].id,
          price: priceId,
        }],
      });
      
      // Update subscription in database
      await supabase
        .from('subscriptions')
        .update({ 
          plan_id: new_plan_id,
          cancel_at_period_end: false
        })
        .eq('id', subscriptionId);
        
      return NextResponse.json({ message: 'Plan changed successfully' });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  
  // Get user from session
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const subscriptionId = params.id;
  
  // Verify subscription belongs to user
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', subscriptionId)
    .eq('user_id', user.id)
    .single();
    
  if (error || !subscription) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
  }
  
  try {
    // Cancel subscription immediately in Stripe
    await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
    
    // Update subscription status in database
    await supabase
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('id', subscriptionId);
      
    return NextResponse.json({ message: 'Subscription canceled successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

## 6. Revenue Analytics Dashboard

### Revenue Overview Component
```tsx
// app/admin/analytics/components/revenue-overview.tsx
'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
         LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface RevenueData {
  overview: {
    total_revenue: number;
    subscription_revenue: number;
    promotion_revenue: number;
    month_over_month_growth: number;
    active_subscribers: number;
    active_promotions: number;
  };
  monthly_revenue: {
    month: string;
    subscriptions: number;
    promotions: number;
    total: number;
  }[];
  plan_distribution: {
    plan: string;
    count: number;
    revenue: number;
  }[];
  promotion_distribution: {
    type: string;
    count: number;
    revenue: number;
  }[];
}

export function RevenueOverview() {
  const [period, setPeriod] = useState('90');
  const [data, setData] = useState<RevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/analytics/revenue?days=${period}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch revenue data');
        }
        
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError('Error loading revenue data. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [period]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Revenue Analytics</h2>
        <Tabs defaultValue={period} onValueChange={(value) => setPeriod(value)}>
          <TabsList>
            <TabsTrigger value="30">30 Days</TabsTrigger>
            <TabsTrigger value="90">90 Days</TabsTrigger>
            <TabsTrigger value="180">6 Months</TabsTrigger>
            <TabsTrigger value="365">1 Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Revenue</CardTitle>
            <CardDescription>Current period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold">${data.overview.total_revenue.toFixed(2)}</span>
              <div className={`flex items-center ${data.overview.month_over_month_growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {data.overview.month_over_month_growth >= 0 ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
                <span>{Math.abs(data.overview.month_over_month_growth).toFixed(1)}%</span>
              </div>
            </div>
            <div className="grid grid-cols-2 mt-4 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Subscriptions</p>
                <p className="font-medium">${data.overview.subscription_revenue.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Promotions</p>
                <p className="font-medium">${data.overview.promotion_revenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Subscribers</CardTitle>
            <CardDescription>By plan type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.overview.active_subscribers}</div>
            <div className="h-24 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.plan_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={40}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {data.plan_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Promotions</CardTitle>
            <CardDescription>By promotion type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.overview.active_promotions}</div>
            <div className="h-24 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.promotion_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={40}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {data.promotion_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="monthly">
        <TabsList>
          <TabsTrigger value="monthly">Monthly Revenue</TabsTrigger>
          <TabsTrigger value="plans">Revenue by Plan</TabsTrigger>
          <TabsTrigger value="promotions">Promotion Types</TabsTrigger>
        </TabsList>
        
        <TabsContent value="monthly" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Breakdown</CardTitle>
              <CardDescription>Subscription vs. Promotion revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data.monthly_revenue}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, '']} />
                    <Legend />
                    <Area type="monotone" dataKey="subscriptions" stackId="1" stroke="#8884d8" fill="#8884d8" name="Subscriptions" />
                    <Area type="monotone" dataKey="promotions" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Promotions" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="plans" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Subscription Plan</CardTitle>
              <CardDescription>Distribution of revenue across different plans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.plan_distribution}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="plan" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip formatter={(value, name) => [name === 'revenue' ? `$${value}` : value, name === 'revenue' ? 'Revenue' : 'Subscribers']} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Subscribers" />
                    <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="promotions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Promotion Type</CardTitle>
              <CardDescription>Distribution of revenue across different promotion options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.promotion_distribution}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip formatter={(value, name) => [name === 'revenue' ? `$${value}` : value, name === 'revenue' ? 'Revenue' : 'Promotions']} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Promotions" />
                    <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### API Endpoint for Revenue Analytics
```typescript
// app/api/analytics/revenue/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '90', 10);
    
    const supabase = createClient();
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (userError || userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get revenue overview
    const { data: revenueSummary } = await supabase.rpc('get_revenue_summary', {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    });
    
    // Get monthly revenue
    const { data: monthlyRevenue } = await supabase.rpc('get_monthly_revenue', {
      months_limit: Math.ceil(days / 30),
    });
    
    // Get plan distribution
    const { data: planDistribution } = await supabase.rpc('get_plan_distribution');
    
    // Get promotion distribution
    const { data: promotionDistribution } = await supabase.rpc('get_promotion_distribution');
    
    return NextResponse.json({
      data: {
        overview: revenueSummary,
        monthly_revenue: monthlyRevenue,
        plan_distribution: planDistribution,
        promotion_distribution: promotionDistribution,
      }
    });
  } catch (error: any) {
    console.error('Revenue analytics error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

## 7. Webhook Handling for Payment Events

```typescript
// app/api/webhooks/stripe/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error(`Webhook signature verification failed: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const supabase = createClient();
  
  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // If this is for a featured listing, create the listing
      if (paymentIntent.metadata.promotion_type) {
        const { group_id, user_id, promotion_type, duration_days } = paymentIntent.metadata;
        
        // Calculate dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + parseInt(duration_days));
        
        // Create featured listing
        await supabase.from('featured_listings').insert({
          group_id,
          user_id,
          promotion_type,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: 'active',
          amount_paid: paymentIntent.amount / 100,
        });
        
        // Update group's promotion status
        await supabase
          .from('groups')
          .update({
            is_promoted: true,
            promotion_type,
            promotion_ends_at: endDate.toISOString(),
          })
          .eq('id', group_id);
      }
      
      // Record payment in payment history
      await supabase.from('payment_history').insert({
        user_id: paymentIntent.metadata.user_id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        payment_method: 'stripe',
        status: 'succeeded',
        type: paymentIntent.metadata.promotion_type ? 'promotion' : 'subscription',
        reference_id: paymentIntent.id,
      });
      
      break;
    }
    
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      
      // Find the subscription in our database
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('id, user_id')
        .eq('stripe_subscription_id', subscription.id)
        .single();
        
      if (subscriptionData) {
        // Update subscription status
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq('id', subscriptionData.id);
      }
      
      break;
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      
      // Find the subscription in our database
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('stripe_subscription_id', subscription.id)
        .single();
        
      if (subscriptionData) {
        // Update subscription status
        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
          })
          .eq('id', subscriptionData.id);
      }
      
      break;
    }
  }

  return NextResponse.json({ received: true });
}