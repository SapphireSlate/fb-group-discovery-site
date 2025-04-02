import Link from "next/link"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"
import { createServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

export default async function CategoriesPage() {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);
  
  // Fetch categories from the database
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching categories:', error);
  }
  
  // Create an icon mapping - we'll use emojis since the database might not have icons
  const categoryIcons: Record<string, string> = {
    "Technology": "💻",
    "Health & Wellness": "🧘",
    "Travel": "✈️",
    "Books & Literature": "📚",
    "Business": "💼",
    "Photography": "📷",
    "Food & Cooking": "🍳",
    "Sports & Fitness": "🏋️",
    "Art & Design": "🎨",
    "Music": "🎵",
    "Parenting": "👶",
    "Gaming": "🎮",
    "Education": "🎓",
    "Science": "🔬",
    "Pets & Animals": "🐾",
    "Fashion": "👗",
    "DIY & Crafts": "🧶",
    "Gardening": "🌱",
    "Other": "📌"
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="container px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
              <p className="text-muted-foreground mt-1">Browse groups by category to find your perfect community</p>
            </div>

            <div className="relative w-full md:w-auto">
              <form action="/discover" method="get">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  name="q"
                  placeholder="Search for groups..." 
                  className="pl-10 w-full md:w-[300px]" 
                />
              </form>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories && categories.length > 0 ? (
              categories.map((category) => (
                <Link key={category.id} href={`/discover?category=${category.id}`}>
                  <Card className="h-full transition-all hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{category.name}</CardTitle>
                        <span className="text-3xl" aria-hidden="true">
                          {categoryIcons[category.name] || "📁"}
                        </span>
                      </div>
                      <CardDescription>{category.description || `Find groups related to ${category.name}`}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {category.group_count || 0} {category.group_count === 1 ? "group" : "groups"}
                        </span>
                        <Button variant="secondary" size="sm">Browse Groups</Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <h3 className="text-lg font-medium">No categories found</h3>
                <p className="text-muted-foreground mt-2">
                  Please check back later or explore all groups directly.
                </p>
                <Link href="/discover" className="mt-4 inline-block">
                  <Button>Browse All Groups</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
} 