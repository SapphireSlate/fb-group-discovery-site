'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircleIcon, ArrowUpIcon, StarIcon, ZapIcon, RocketIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function PromotePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [durationDays, setDurationDays] = useState<7 | 30 | 90>(30)
  
  const handleSelectPromotion = (promotionType: string) => {
    if (!user) {
      router.push(`/login?redirect=/promote&promotion=${promotionType}`)
      return
    }
    
    // For demo purposes we'll assume the user needs to submit a group first
    // In a real app, we would check if the user has groups they own
    router.push(`/checkout/promotion?type=${promotionType}&days=${durationDays}`)
  }
  
  const promotions = [
    {
      id: 'featured',
      name: 'Featured Listing',
      description: 'Highlight your group at the top of search results',
      icon: <StarIcon className="h-6 w-6 mb-2 text-yellow-500" />,
      prices: {
        7: 15.00,
        30: 49.99,
        90: 129.99
      },
      features: [
        'Priority placement in search results',
        'Featured badge on your group',
        'Highlighted in category pages',
        '50% more visibility'
      ],
      popular: true
    },
    {
      id: 'category_spotlight',
      name: 'Category Spotlight',
      description: 'Feature your group in its category',
      icon: <ZapIcon className="h-6 w-6 mb-2 text-purple-500" />,
      prices: {
        7: 12.00,
        30: 39.99,
        90: 99.99
      },
      features: [
        'Top position in your category',
        'Category spotlight badge',
        'Included in category newsletters',
        '35% more category traffic'
      ],
      popular: false
    },
    {
      id: 'enhanced_listing',
      name: 'Enhanced Listing',
      description: 'Stand out with rich visuals and features',
      icon: <ArrowUpIcon className="h-6 w-6 mb-2 text-blue-500" />,
      prices: {
        7: 19.99,
        30: 59.99,
        90: 149.99
      },
      features: [
        'Expanded group description',
        'Gallery of up to 10 images',
        'Custom promotional message',
        'Advanced analytics dashboard'
      ],
      popular: false
    },
    {
      id: 'bundle',
      name: 'Full Promotion Bundle',
      description: 'Complete promotion package with all benefits',
      icon: <RocketIcon className="h-6 w-6 mb-2 text-green-500" />,
      prices: {
        7: 29.99,
        30: 89.99,
        90: 199.99
      },
      features: [
        'All features from other packages',
        'Homepage banner placement',
        'Weekly analytical reports',
        'Priority support for group owners'
      ],
      popular: false
    }
  ]
  
  return (
    <div className="container max-w-7xl py-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold">Promote Your Facebook Group</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Increase visibility and attract the right members to your community
          </p>
          
          <div className="mt-6">
            <Tabs 
              defaultValue="30" 
              onValueChange={(value) => setDurationDays(parseInt(value) as 7 | 30 | 90)}
              className="inline-flex"
            >
              <TabsList>
                <TabsTrigger value="7">7 Days</TabsTrigger>
                <TabsTrigger value="30">30 Days</TabsTrigger>
                <TabsTrigger value="90">90 Days</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promotions.map((promotion) => (
            <Card 
              key={promotion.id} 
              className={`${promotion.popular ? 'border-primary' : ''} flex flex-col`}
            >
              <CardHeader className={`${promotion.popular ? 'bg-primary/5' : ''}`}>
                {promotion.popular && (
                  <div className="text-center mb-2">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs">
                      MOST EFFECTIVE
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{promotion.name}</CardTitle>
                    <CardDescription>{promotion.description}</CardDescription>
                  </div>
                  {promotion.icon}
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold">${promotion.prices[durationDays].toFixed(2)}</span>
                  <span className="text-muted-foreground ml-1">/{durationDays} days</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2">
                  {promotion.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircleIcon className="mr-2 h-5 w-5 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  variant={promotion.popular ? 'default' : 'outline'} 
                  className="w-full"
                  onClick={() => handleSelectPromotion(promotion.id)}
                  disabled={isLoading}
                >
                  Promote Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 border-t pt-8">
          <h2 className="text-xl font-bold mb-4 text-center">Promotion FAQ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="font-semibold text-lg">How does promotion placement work?</h3>
              <p className="text-muted-foreground mt-1">
                Promoted groups receive priority placement in search results, category pages, and 
                recommendations based on the promotion package you select.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Can I cancel a promotion?</h3>
              <p className="text-muted-foreground mt-1">
                Once activated, promotions run for their full duration. We don't offer refunds for 
                partially used promotion periods.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg">How do I measure promotion effectiveness?</h3>
              <p className="text-muted-foreground mt-1">
                All promotions include access to analytics that show views, clicks, and member joins 
                attributed to your promotion.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Can I promote multiple groups?</h3>
              <p className="text-muted-foreground mt-1">
                Yes, you can purchase promotions for each group you manage. Each promotion is specific 
                to a single Facebook group.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 