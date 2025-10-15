'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"
import { Plus, Eye, Edit, Trash2, BarChart3, TrendingUp, Users } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface Ad {
  id: string
  slot: 'sidebar' | 'top_banner'
  creative_type: 'image' | 'html'
  target_url: string
  status: 'pending' | 'approved' | 'active' | 'expired'
  start_date: string
  end_date: string
  amount_paid: number
  impressions: number
  clicks: number
  created_at: string
}

export default function AdDashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [ads, setAds] = useState<Ad[]>([])
  const [isLoadingAds, setIsLoadingAds] = useState(true)

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/advertise/dashboard')
    }
  }, [user, isLoading, router])

  // Fetch user's ads
  useEffect(() => {
    if (user) {
      fetchAds()
    }
  }, [user])

  const fetchAds = async () => {
    try {
      const response = await fetch('/api/ads/manage')
      if (response.ok) {
        const result = await response.json()
        setAds(result.data)
      }
    } catch (error) {
      console.error('Error fetching ads:', error)
    } finally {
      setIsLoadingAds(false)
    }
  }

  const handleDeleteAd = async (adId: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) {
      return
    }

    try {
      const response = await fetch(`/api/ads/manage?ad_id=${adId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Refresh ads list
        fetchAds()
      } else {
        alert('Failed to delete ad')
      }
    } catch (error) {
      console.error('Error deleting ad:', error)
      alert('Failed to delete ad')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-blue-100 text-blue-800'
      case 'expired':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSlotName = (slot: string) => {
    switch (slot) {
      case 'sidebar':
        return 'Sidebar Ad'
      case 'top_banner':
        return 'Top Banner'
      default:
        return slot
    }
  }

  const activeAds = ads.filter(ad => ad.status === 'active')
  const totalImpressions = ads.reduce((sum, ad) => sum + ad.impressions, 0)
  const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0)
  const totalSpent = ads.reduce((sum, ad) => sum + ad.amount_paid, 0)

  if (isLoading || !user) {
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
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold">Ad Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Manage your advertisements and track performance
                </p>
              </div>
              <Button onClick={() => router.push('/advertise/create')} className="mt-4 sm:mt-0">
                <Plus className="mr-2 h-4 w-4" />
                Create New Ad
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeAds.length}</div>
                  <p className="text-xs text-muted-foreground">
                    of {ads.length} total ads
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    ads viewed by users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    user interactions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    on advertising
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Ads List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Advertisements</CardTitle>
                <CardDescription>
                  Manage and track the performance of your ads
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAds ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading your ads...</p>
                  </div>
                ) : ads.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mb-4">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No ads yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Create your first advertisement to get started
                    </p>
                    <Button onClick={() => router.push('/advertise/create')}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Ad
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ads.map((ad) => (
                      <div key={ad.id} className="border rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{getSlotName(ad.slot)}</h3>
                              <Badge className={getStatusColor(ad.status)}>
                                {ad.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Target: {ad.target_url}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Duration: {new Date(ad.start_date).toLocaleDateString()} - {new Date(ad.end_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="mt-4 sm:mt-0 text-right">
                            <p className="font-semibold">${ad.amount_paid.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">Total spent</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-lg font-semibold">{ad.impressions}</p>
                            <p className="text-xs text-muted-foreground">Impressions</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold">{ad.clicks}</p>
                            <p className="text-xs text-muted-foreground">Clicks</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold">
                              {ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : 0}%
                            </p>
                            <p className="text-xs text-muted-foreground">CTR</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold">
                              ${ad.impressions > 0 ? (ad.amount_paid / ad.impressions * 1000).toFixed(2) : 0}
                            </p>
                            <p className="text-xs text-muted-foreground">CPM</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAd(ad.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
