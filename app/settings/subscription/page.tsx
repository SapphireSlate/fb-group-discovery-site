'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useAuth } from '@/hooks/use-auth'
import { Loader2Icon, CreditCardIcon, AlertTriangleIcon, CheckCircleIcon, RefreshCcwIcon } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

export default function SubscriptionPage() {
  const router = useRouter()
  const { user, subscription, isLoading } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [actionResult, setActionResult] = useState<{success: boolean, message: string} | null>(null)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const supabase = createClientComponentClient()
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const planDetails = {
    premium: {
      name: 'Premium Plan',
      price: '$5.99/month',
      features: [
        'Advanced search filters',
        'Ad-free experience',
        'Early access to new groups',
        'Premium user badge',
        'Personalized recommendations',
        'Save favorite groups'
      ]
    },
    professional: {
      name: 'Professional Plan',
      price: '$9.99/month',
      features: [
        'All Premium features',
        'Personal analytics dashboard',
        'API access',
        'Priority customer support',
        'Dedicated account manager',
        'Advanced group analytics',
        'Bulk CSV export'
      ]
    }
  }
  
  const currentPlan = subscription?.plan_id ? 
    planDetails[subscription.plan_id as keyof typeof planDetails] : null
  
  const handleCancelSubscription = async () => {
    if (!user || !subscription) return
    
    setIsProcessing(true)
    setActionResult(null)
    
    try {
      // In a real app, this would cancel the subscription with the payment processor
      // For this demo, we'll simulate a cancellation
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update subscription record in database
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('status', 'active')
      
      if (error) throw error
      
      setActionResult({
        success: true,
        message: 'Your subscription has been canceled. You will continue to have access until the end of your current billing period.'
      })
      
      // Force reload of auth context to get updated subscription info
      window.location.reload()
    } catch (error) {
      console.error('Error canceling subscription:', error)
      setActionResult({
        success: false,
        message: 'There was an error canceling your subscription. Please try again or contact support.'
      })
    } finally {
      setIsProcessing(false)
      setConfirmCancel(false)
    }
  }
  
  const handleUpdatePaymentMethod = async () => {
    setIsProcessing(true)
    setActionResult(null)
    
    try {
      // In a real app, this would update the payment method with the payment processor
      // For this demo, we'll simulate a success
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setActionResult({
        success: true,
        message: 'Your payment method has been successfully updated.'
      })
    } catch (error) {
      console.error('Error updating payment method:', error)
      setActionResult({
        success: false,
        message: 'There was an error updating your payment method. Please try again or contact support.'
      })
    } finally {
      setIsProcessing(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  if (!user) {
    return (
      <div className="container py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-2">Account Required</h1>
          <p className="text-muted-foreground mb-6">
            Please log in to manage your subscription.
          </p>
          <Button asChild>
            <Link href="/login?redirect=/settings/subscription">Log In</Link>
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Subscription Settings</h1>
        <p className="text-muted-foreground mb-6">
          Manage your plan and billing details
        </p>
        
        <Tabs defaultValue="plan" className="mt-6">
          <TabsList className="mb-6">
            <TabsTrigger value="plan">Subscription Plan</TabsTrigger>
            <TabsTrigger value="billing">Billing Information</TabsTrigger>
            <TabsTrigger value="history">Payment History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="plan">
            {subscription ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Current Plan</CardTitle>
                        <CardDescription>Your active subscription</CardDescription>
                      </div>
                      <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                        {subscription.status === 'active' ? 'Active' : 'Canceled'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold">{currentPlan?.name || subscription.plan_id}</h3>
                        <p className="text-muted-foreground">{currentPlan?.price || ''}</p>
                      </div>
                      
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-muted-foreground">Renewal Date</span>
                        <span className="font-medium">{formatDate(subscription.current_period_end)}</span>
                      </div>
                      
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-muted-foreground">Status</span>
                        <span className="font-medium">{subscription.status === 'active' 
                          ? 'Active' 
                          : 'Canceled (expires soon)'}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col items-stretch gap-2">
                    {subscription.status === 'active' ? (
                      <>
                        <Button 
                          variant="outline"
                          onClick={() => router.push('/pricing')}
                        >
                          Change Plan
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => setConfirmCancel(true)}
                        >
                          Cancel Subscription
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => router.push('/pricing')}>
                        Reactivate Subscription
                      </Button>
                    )}
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Plan Features</CardTitle>
                    <CardDescription>What's included in your plan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {currentPlan ? (
                      <ul className="space-y-2">
                        {currentPlan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircleIcon className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">Feature details not available</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Active Subscription</CardTitle>
                  <CardDescription>
                    You don't have an active subscription plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    Unlock premium features by subscribing to one of our plans. Get access to advanced search filters, 
                    ad-free experience, and much more.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => router.push('/pricing')}>
                    View Plans
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="billing">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>Manage your payment details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-4">
                    <CreditCardIcon className="h-10 w-10 text-muted-foreground mr-3" />
                    <div>
                      <p className="font-medium">Visa ending in 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" onClick={handleUpdatePaymentMethod} disabled={isProcessing}>
                    {isProcessing ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Update Payment Method
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Billing Address</CardTitle>
                  <CardDescription>Your billing information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p>John Doe</p>
                    <p>123 Main Street</p>
                    <p>Apt 4B</p>
                    <p>New York, NY 10001</p>
                    <p>United States</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline">
                    Update Billing Address
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Recent transactions for your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b">
                    <div>
                      <p className="font-medium">Premium Plan - Monthly</p>
                      <p className="text-sm text-muted-foreground">July 15, 2023</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$5.99</p>
                      <Badge variant="outline" className="text-green-500">Paid</Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-between py-3 border-b">
                    <div>
                      <p className="font-medium">Premium Plan - Monthly</p>
                      <p className="text-sm text-muted-foreground">June 15, 2023</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$5.99</p>
                      <Badge variant="outline" className="text-green-500">Paid</Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-between py-3 border-b">
                    <div>
                      <p className="font-medium">Premium Plan - Monthly</p>
                      <p className="text-sm text-muted-foreground">May 15, 2023</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$5.99</p>
                      <Badge variant="outline" className="text-green-500">Paid</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline">
                  Download Invoices
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        
        {actionResult && (
          <Alert 
            className={`mt-6 ${actionResult.success ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-destructive'}`}
          >
            <AlertTitle className={actionResult.success ? 'text-green-600' : 'text-destructive'}>
              {actionResult.success ? (
                <CheckCircleIcon className="h-4 w-4 inline-block mr-2" />
              ) : (
                <AlertTriangleIcon className="h-4 w-4 inline-block mr-2" />
              )}
              {actionResult.success ? 'Success' : 'Error'}
            </AlertTitle>
            <AlertDescription>{actionResult.message}</AlertDescription>
          </Alert>
        )}
        
        {/* Cancel Subscription Confirmation Dialog */}
        <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Subscription</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your current billing period.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Alert variant="destructive">
                <AlertTriangleIcon className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  This action cannot be undone. You'll need to resubscribe if you want to regain access.
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmCancel(false)}>
                Keep Subscription
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleCancelSubscription}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Cancellation'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 