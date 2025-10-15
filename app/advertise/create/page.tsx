'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"
import { ArrowLeft, Upload, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export default function CreateAdPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [creativeType, setCreativeType] = useState<'image' | 'html'>('image')

  // Get ad type from URL parameters
  const adType = searchParams.get('type')
  const [adSlot, setAdSlot] = useState<'sidebar' | 'top_banner'>(adType === 'top_banner' ? 'top_banner' : 'sidebar')
  const [duration, setDuration] = useState(7)

  const [formData, setFormData] = useState({
    target_url: '',
    creative_url: '',
    html_content: '',
    start_date: new Date().toISOString().split('T')[0]
  })

  // Redirect if not logged in
  if (!isLoading && !user) {
    router.push('/login?redirect=/advertise/create')
    return null
  }

  // Calculate pricing
  const pricePerDay = adSlot === 'sidebar' ? 25 : 49
  const totalAmount = pricePerDay * duration

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = {
        slot: adSlot,
        creative_type: creativeType,
        target_url: formData.target_url,
        duration_days: duration,
        start_date: formData.start_date,
        ...(creativeType === 'image'
          ? { creative_url: formData.creative_url }
          : { html: formData.html_content }
        )
      }

      const response = await fetch('/api/ads/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to create ad')
      }

      const result = await response.json()

      // Redirect to checkout with ad details
      router.push(`/checkout/ad?ad_id=${result.ad.id}&amount=${totalAmount}`)

    } catch (error) {
      console.error('Error creating ad:', error)
      alert('Failed to create ad. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="container py-10">
          <div className="max-w-2xl mx-auto">
            <Button
              variant="ghost"
              className="mb-6"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Advertise
            </Button>

            <Card>
              <CardHeader>
                <CardTitle>Create New Ad</CardTitle>
                <CardDescription>
                  Set up your advertisement and select your preferred placement and duration.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Ad Slot Selection */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Ad Placement</Label>
                    <RadioGroup
                      value={adSlot}
                      onValueChange={(value: 'sidebar' | 'top_banner') => setAdSlot(value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sidebar" id="sidebar" />
                        <Label htmlFor="sidebar" className="cursor-pointer">
                          <div>
                            <div className="font-medium">Sidebar Ad</div>
                            <div className="text-sm text-muted-foreground">
                              Appears in the sidebar of group detail pages - $25/day
                            </div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="top_banner" id="top_banner" />
                        <Label htmlFor="top_banner" className="cursor-pointer">
                          <div>
                            <div className="font-medium">Top Banner Ad</div>
                            <div className="text-sm text-muted-foreground">
                              Prominent placement at the top of discover pages - $49/day
                            </div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Duration Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="duration" className="text-base font-semibold">Duration</Label>
                    <Select
                      value={duration.toString()}
                      onValueChange={(value) => setDuration(parseInt(value))}
                    >
                      <SelectTrigger id="duration">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days - ${(pricePerDay * 7)}</SelectItem>
                        <SelectItem value="14">14 days - ${(pricePerDay * 14)}</SelectItem>
                        <SelectItem value="30">30 days - ${(pricePerDay * 30)}</SelectItem>
                        <SelectItem value="60">60 days - ${(pricePerDay * 60)}</SelectItem>
                        <SelectItem value="90">90 days - ${(pricePerDay * 90)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label htmlFor="start_date" className="text-base font-semibold">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleInputChange('start_date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  {/* Creative Type Selection */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Creative Type</Label>
                    <RadioGroup
                      value={creativeType}
                      onValueChange={(value: 'image' | 'html') => setCreativeType(value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="image" id="image" />
                        <Label htmlFor="image" className="cursor-pointer flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" />
                          Image Ad
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="html" id="html" />
                        <Label htmlFor="html" className="cursor-pointer">
                          HTML Ad (Custom)
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Creative Content */}
                  {creativeType === 'image' ? (
                    <div className="space-y-2">
                      <Label htmlFor="creative_url" className="text-base font-semibold">Image URL</Label>
                      <Input
                        id="creative_url"
                        placeholder="https://example.com/ad-image.jpg"
                        value={formData.creative_url}
                        onChange={(e) => handleInputChange('creative_url', e.target.value)}
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        Recommended size: {adSlot === 'sidebar' ? '300x250 pixels' : '728x90 pixels'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="html_content" className="text-base font-semibold">HTML Content</Label>
                      <Textarea
                        id="html_content"
                        placeholder="<div class='ad-content'>Your HTML ad here</div>"
                        value={formData.html_content}
                        onChange={(e) => handleInputChange('html_content', e.target.value)}
                        rows={6}
                        required
                      />
                    </div>
                  )}

                  {/* Target URL */}
                  <div className="space-y-2">
                    <Label htmlFor="target_url" className="text-base font-semibold">Destination URL</Label>
                    <Input
                      id="target_url"
                      placeholder="https://your-website.com"
                      value={formData.target_url}
                      onChange={(e) => handleInputChange('target_url', e.target.value)}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Where users will be taken when they click your ad
                    </p>
                  </div>

                  {/* Pricing Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Ad placement:</span>
                        <span>{adSlot === 'sidebar' ? 'Sidebar' : 'Top Banner'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{duration} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price per day:</span>
                        <span>${pricePerDay}</span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>${totalAmount}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating Ad...' : `Create Ad & Pay $${totalAmount}`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
