'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircleIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function PricingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  
  const handleSelectPlan = (planId: string) => {
    if (!user) {
      router.push(`/login?redirect=/pricing&plan=${planId}`);
      return;
    }
    
    router.push(`/checkout?plan=${planId}&interval=${billingInterval}`);
  };
  
  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'For casual browsers',
      price: {
        monthly: 0,
        yearly: 0
      },
      features: [
        'Standard group discovery',
        'Basic search filters',
        'Vote and review groups',
        'Personal profile'
      ],
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'For avid community members',
      price: {
        monthly: 5.99,
        yearly: 59.99
      },
      features: [
        'All Basic features',
        'Advanced search filters',
        'Ad-free experience',
        'Early access to new groups',
        'Premium user badge'
      ],
      popular: true
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'For business networkers',
      price: {
        monthly: 9.99,
        yearly: 99.99
      },
      features: [
        'All Premium features',
        'Personal analytics dashboard',
        'API access',
        'Priority customer support',
        'Dedicated account manager'
      ],
      popular: false
    }
  ];
  
  return (
    <div className="container max-w-7xl py-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold">Choose Your Plan</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Select the plan that best fits your needs to discover and connect with the perfect Facebook groups.
          </p>
          
          <div className="mt-6 flex items-center justify-center space-x-4">
            <Button
              variant={billingInterval === 'monthly' ? 'default' : 'outline'}
              onClick={() => setBillingInterval('monthly')}
            >
              Monthly Billing
            </Button>
            <Button
              variant={billingInterval === 'yearly' ? 'default' : 'outline'}
              onClick={() => setBillingInterval('yearly')}
            >
              Yearly Billing
              <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-900 dark:text-green-100">
                Save 16%
              </span>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`${plan.popular ? 'border-primary' : ''} flex flex-col`}
            >
              <CardHeader className={`${plan.popular ? 'bg-primary/5' : ''}`}>
                {plan.popular && (
                  <div className="text-center mb-2">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs">
                      POPULAR
                    </span>
                  </div>
                )}
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">
                    {plan.price[billingInterval] === 0 ? 'Free' : `$${plan.price[billingInterval]}`}
                  </span>
                  {plan.price[billingInterval] !== 0 && (
                    <span className="text-muted-foreground ml-1">
                      /{billingInterval === 'monthly' ? 'month' : 'year'}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircleIcon className="mr-2 h-5 w-5 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  variant={plan.popular ? 'default' : 'outline'} 
                  className="w-full"
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isLoading}
                >
                  {plan.price[billingInterval] === 0 ? 'Get Started' : 'Subscribe Now'}
                </Button>
              </CardFooter>
            </Card>
          ))}
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
        
        <div className="mt-16 border-t pt-8">
          <h2 className="text-xl font-bold mb-4 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="font-semibold text-lg">What is included in the premium plan?</h3>
              <p className="text-muted-foreground mt-1">
                The premium plan includes all basic features plus advanced search filters, 
                an ad-free experience, early access to newly added groups, and a premium user badge.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Can I cancel my subscription?</h3>
              <p className="text-muted-foreground mt-1">
                Yes, you can cancel your subscription at any time. Your benefits will continue until 
                the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg">How does the API access work?</h3>
              <p className="text-muted-foreground mt-1">
                Professional plan members get access to our API, allowing you to integrate our group data 
                into your applications with dedicated documentation and support.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Do you offer refunds?</h3>
              <p className="text-muted-foreground mt-1">
                We offer a 14-day money-back guarantee if you're not satisfied with your subscription. 
                Contact our support team to request a refund.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 