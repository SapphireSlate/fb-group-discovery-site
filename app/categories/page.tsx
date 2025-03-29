import Link from "next/link"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"
import { Category } from "@/lib/types"

export default function CategoriesPage() {
  // Mock data for categories - this would typically come from an API
  const categories: Category[] = [
    { id: "1", name: "Technology", description: "Groups focused on tech innovations and gadgets", groupCount: 342, icon: "💻" },
    { id: "2", name: "Health & Wellness", description: "Groups for health tips and wellness advice", groupCount: 256, icon: "🧘" },
    { id: "3", name: "Travel", description: "Groups for travelers and adventure seekers", groupCount: 189, icon: "✈️" },
    { id: "4", name: "Books & Literature", description: "Groups for book lovers and literary discussions", groupCount: 142, icon: "📚" },
    { id: "5", name: "Business", description: "Groups for entrepreneurs and business professionals", groupCount: 273, icon: "💼" },
    { id: "6", name: "Photography", description: "Groups for photography enthusiasts", groupCount: 198, icon: "📷" },
    { id: "7", name: "Food & Cooking", description: "Groups for food lovers and cooking enthusiasts", groupCount: 321, icon: "🍳" },
    { id: "8", name: "Sports & Fitness", description: "Groups for sports fans and fitness enthusiasts", groupCount: 245, icon: "🏋️" },
    { id: "9", name: "Art & Design", description: "Groups for artists and designers", groupCount: 187, icon: "🎨" },
    { id: "10", name: "Music", description: "Groups for music lovers and musicians", groupCount: 234, icon: "🎵" },
    { id: "11", name: "Parenting", description: "Groups for parents and childcare", groupCount: 176, icon: "👶" },
    { id: "12", name: "Gaming", description: "Groups for gamers and gaming enthusiasts", groupCount: 289, icon: "🎮" },
    { id: "13", name: "Education", description: "Groups for students, teachers, and educators", groupCount: 215, icon: "🎓" },
    { id: "14", name: "Science", description: "Groups for science enthusiasts and discussions", groupCount: 167, icon: "🔬" },
    { id: "15", name: "Pets & Animals", description: "Groups for pet owners and animal lovers", groupCount: 198, icon: "🐾" },
    { id: "16", name: "Fashion", description: "Groups for fashion enthusiasts and style discussions", groupCount: 145, icon: "👗" },
    { id: "17", name: "DIY & Crafts", description: "Groups for crafters and DIY enthusiasts", groupCount: 178, icon: "🧶" },
    { id: "18", name: "Gardening", description: "Groups for gardening enthusiasts", groupCount: 123, icon: "🌱" },
  ]

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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search categories..." 
                className="pl-10 w-full md:w-[300px]" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/discover?category=${encodeURIComponent(category.name)}`}>
                <Card className="h-full transition-all hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{category.name}</CardTitle>
                      <span className="text-3xl" aria-hidden="true">{category.icon}</span>
                    </div>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {category.groupCount} {category.groupCount === 1 ? "group" : "groups"}
                      </span>
                      <Button variant="secondary" size="sm">Browse Groups</Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
} 