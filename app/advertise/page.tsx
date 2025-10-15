'use client'

import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Users, TrendingUp, Zap } from "lucide-react"
import { useRouter } from 'next/navigation'

export default function AdvertisePage() {
  const router = useRouter()
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16">
          <div className="container px-4 md:px-6 flex flex-col items-center text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Partner with us
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">
              Partner with GroupFinder
            </h1>
            <p className="md:text-xl text-muted-foreground max-w-[700px] mb-8">
              Reach thousands of business owners and entrepreneurs actively seeking Facebook groups
              for networking and growth. Partner with us to grow your audience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="rounded-full px-8" variant="outline" onClick={() => router.push('#pricing')}>
                View Ad Pricing
              </Button>
              <Button size="lg" className="rounded-full px-8" onClick={() => router.push('/advertise/create')}>
                Create Your First Ad
              </Button>
            </div>
          </div>
        </section>

        {/* Why Partner Section */}
        <section className="py-16">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Partner with Us</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We're building the go-to directory for Facebook groups. Our audience consists of
                business owners, entrepreneurs, and professionals who actively seek communities
                to grow their networks and businesses.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Targeted Audience</CardTitle>
                  <CardDescription>
                    Reach business owners and entrepreneurs who are actively seeking Facebook groups
                    for networking, marketing, and professional growth.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <TrendingUp className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Growing Platform</CardTitle>
                  <CardDescription>
                    We're experiencing steady growth with thousands of monthly visitors. Join us
                    as we scale and reach more business professionals.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Zap className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>High Engagement</CardTitle>
                  <CardDescription>
                    Our users are highly engaged with developer tools and productivity solutions.
                    They actively influence technology choices within their organizations.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Partnership Options */}
        <section className="py-16 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Advertising Options</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Choose from our advertising products to reach business owners and entrepreneurs
                actively seeking Facebook groups for networking and growth.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-2 hover:border-primary/20 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Sidebar Ads
                  </CardTitle>
                  <CardDescription>
                    Display your ad in the sidebar of group detail pages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• High visibility on group pages</li>
                    <li>• Targeted business audience</li>
                    <li>• Click and impression tracking</li>
                    <li>• Custom image or HTML creatives</li>
                  </ul>
                  <div className="mt-4">
                    <p className="text-lg font-semibold">Starting at $25/day</p>
                    <p className="text-xs text-muted-foreground">Minimum 7 days</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline" onClick={() => router.push('/advertise/create?type=sidebar')}>
                    Purchase Sidebar Ad
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-2 hover:border-primary/20 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Top Banner Ads
                  </CardTitle>
                  <CardDescription>
                    Prominent banner placement at the top of discover pages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Maximum visibility on search results</li>
                    <li>• Appears above organic results</li>
                    <li>• Rotates with other banner ads</li>
                    <li>• Performance analytics included</li>
                  </ul>
                  <div className="mt-4">
                    <p className="text-lg font-semibold">Starting at $49/day</p>
                    <p className="text-xs text-muted-foreground">Minimum 7 days</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline" onClick={() => router.push('/advertise/create?type=top_banner')}>
                    Purchase Banner Ad
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-2 hover:border-primary/20 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Group Promotions
                  </CardTitle>
                  <CardDescription>
                    Promote your Facebook group at the top of discover results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Featured placement in search results</li>
                    <li>• Priority in your categories</li>
                    <li>• Promoted badge and highlighting</li>
                    <li>• Detailed performance metrics</li>
                  </ul>
                  <div className="mt-4">
                    <p className="text-lg font-semibold">Starting at $15/day</p>
                    <p className="text-xs text-muted-foreground">Per group promotion</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline" onClick={() => router.push('/promote')}>
                    Promote Your Group
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* Audience Stats */}
        <section className="py-16">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Growing Community</h2>
              <p className="text-muted-foreground">
                Join thousands of business owners and entrepreneurs who trust GroupFinder
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">10K+</div>
                <div className="text-muted-foreground">Monthly Visitors</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">5K+</div>
                <div className="text-muted-foreground">Facebook Groups</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">50+</div>
                <div className="text-muted-foreground">Categories</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">85%</div>
                <div className="text-muted-foreground">Business Owners</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Partner with Us?</h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Let's discuss how we can help you reach our engaged community of business owners
              and entrepreneurs. Get in touch to explore partnership opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Contact Us
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                View Pricing
              </Button>
            </div>
            <p className="text-blue-100 text-sm mt-4">
              Email us at <span className="font-medium">hello@groupfinder.com</span> to get started
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
