'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle, CreditCard, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading } = useAuth()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  
  // Get parameters from URL
  const plan = searchParams.get('plan')
  const promotionType = searchParams.get('type')
  const days = searchParams.get('days')
  const interval = searchParams.get('interval') || 'monthly'
  
  const isPromotion = !!promotionType
  
  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/checkout')
    }
  }, [user, isLoading, router])
  
  // Get product details based on parameters
  const getProductDetails = () => {
    if (isPromotion) {
      // Promotion pricing
      const prices = {
        featured: { 7: 15.00, 30: 49.99, 90: 129.99 },
        category_spotlight: { 7: 12.00, 30: 39.99, 90: 99.99 },
        enhanced_listing: { 7: 19.99, 30: 59.99, 90: 149.99 },
        bundle: { 7: 29.99, 30: 89.99, 90: 199.99 }
      }
      
      const names = {
        featured: 'Featured Listing',
        category_spotlight: 'Category Spotlight',
        enhanced_listing: 'Enhanced Listing',
        bundle: 'Full Promotion Bundle'
      }
      
      const daysNum = parseInt(days || '30')
      const priceType = promotionType as keyof typeof prices
      
      return {
        name: names[priceType as keyof typeof names] || 'Group Promotion',
        price: prices[priceType]?.[daysNum as keyof typeof prices[typeof priceType]] || 49.99,
        description: `${daysNum} days of promotion`
      }
    } else {
      // Subscription pricing
      const prices = {
        basic: { monthly: 0, yearly: 0 },
        premium: { monthly: 5.99, yearly: 59.99 },
        professional: { monthly: 9.99, yearly: 99.99 }
      }
      
      const names = {
        basic: 'Basic Plan',
        premium: 'Premium Plan',
        professional: 'Professional Plan'
      }
      
      const priceType = plan as keyof typeof prices
      
      return {
        name: names[priceType as keyof typeof names] || 'Subscription',
        price: prices[priceType]?.[interval as keyof typeof prices[typeof priceType]] || 5.99,
        description: `${interval === 'yearly' ? 'Annual' : 'Monthly'} subscription`
      }
    }
  }
  
  const product = getProductDetails()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    
    try {
      // Simulate API call to payment processor
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real application, this would integrate with Stripe or another payment processor
      // and handle the actual subscription or promotion purchase.
      
      setIsComplete(true)
      
      // Redirect after showing success message
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
    } catch (error) {
      console.error('Payment error:', error)
      setIsProcessing(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  if (isComplete) {
    return (
      <div className="container py-10">
        <div className="max-w-md mx-auto">
          <Card className="border-green-500">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold">Payment Successful!</h2>
              <p className="text-muted-foreground mt-2">
                {isPromotion 
                  ? 'Your group promotion has been activated successfully.'
                  : 'Your subscription has been activated successfully.'}
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Redirecting you to your dashboard...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container py-10">
      <div className="max-w-md mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Checkout
            </CardTitle>
            <CardDescription>
              Complete your {isPromotion ? 'promotion purchase' : 'subscription'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between py-2">
                <span className="font-medium">{product.name}</span>
                <span className="font-bold">${product.price.toFixed(2)}</span>
              </div>
              <div className="text-sm text-muted-foreground pb-2 border-b">
                {product.description}
              </div>
              
              <Separator className="my-4" />
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardName">Name on card</Label>
                  <Input id="cardName" placeholder="John Smith" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card number</Label>
                  <Input id="cardNumber" placeholder="4242 4242 4242 4242" required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry date</Label>
                    <Input id="expiry" placeholder="MM/YY" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="123" required />
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-6" 
                  type="submit" 
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Processing...
                    </>
                  ) : (
                    `Pay $${product.price.toFixed(2)}`
                  )}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  Your payment is secure and encrypted. By proceeding, you agree to our terms of service.
                </p>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 