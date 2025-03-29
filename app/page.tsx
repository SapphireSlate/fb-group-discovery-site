import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import GroupCard from "@/components/group-card"
import CategoryPill from "@/components/category-pill"
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import { Group as MockGroup, Category } from "@/lib/types"
import { Database } from "@/lib/database.types"

// Define the database Group type to match what GroupCard expects
type DatabaseGroup = Database['public']['Tables']['groups']['Row'] & {
  categories?: Database['public']['Tables']['categories']['Row'] | null;
  groups_tags?: { tag_id: string }[] | null;
};

// Helper function to convert mock group to database group format
function convertToDbGroup(mockGroup: MockGroup): DatabaseGroup {
  return {
    id: mockGroup.id,
    name: mockGroup.name,
    description: mockGroup.description,
    url: mockGroup.url,
    screenshot_url: mockGroup.screenshot || null,
    submitted_by: mockGroup.submittedBy,
    submitted_at: mockGroup.submittedAt.toISOString(),
    upvotes: mockGroup.upvotes,
    downvotes: mockGroup.downvotes,
    average_rating: mockGroup.averageRating,
    view_count: mockGroup.viewCount,
    is_private: mockGroup.isPrivate,
    is_verified: mockGroup.isVerified,
    status: mockGroup.status,
    size: mockGroup.size || null,
    activity_level: mockGroup.activityLevel || null,
    category_id: null, // Placeholder
    last_verified: null,
    search_vector: null,
    categories: mockGroup.category ? {
      id: "mock-category-id",
      name: mockGroup.category,
      description: null,
      icon: null,
      group_count: 0
    } : null,
    groups_tags: mockGroup.tags?.map(tag => ({ tag_id: tag })) || null,
  };
}

export default function Home() {
  // Mock data for groups - this would typically come from an API
  const mockFeaturedGroups: MockGroup[] = [
    {
      id: "1",
      name: "Tech Enthusiasts",
      description: "A community for tech lovers to discuss the latest trends and innovations.",
      url: "https://facebook.com/groups/tech-enthusiasts",
      size: 15432,
      activityLevel: "Very Active",
      category: "Technology",
      tags: ["Technology", "Innovation", "Gadgets"],
      screenshot: "/placeholder.svg?height=300&width=300",
      submittedBy: "user1",
      submittedAt: new Date("2023-01-15"),
      upvotes: 243,
      downvotes: 12,
      averageRating: 4.7,
      viewCount: 5432,
      isPrivate: false,
      isVerified: true,
      status: 'active',
    },
    {
      id: "2",
      name: "Healthy Living",
      description: "Share tips and advice for maintaining a healthy lifestyle and wellness.",
      url: "https://facebook.com/groups/healthy-living",
      size: 8765,
      activityLevel: "Active",
      category: "Health & Wellness",
      tags: ["Health", "Wellness", "Fitness", "Nutrition"],
      screenshot: "/placeholder.svg?height=300&width=300",
      submittedBy: "user2",
      submittedAt: new Date("2023-02-20"),
      upvotes: 187,
      downvotes: 5,
      averageRating: 4.9,
      viewCount: 3245,
      isPrivate: false,
      isVerified: true,
      status: 'active',
    },
    {
      id: "3",
      name: "Digital Nomads",
      description: "Connect with people who work remotely while traveling the world.",
      url: "https://facebook.com/groups/digital-nomads",
      size: 5432,
      activityLevel: "Moderate",
      category: "Travel",
      tags: ["Remote Work", "Travel", "Digital Nomad", "Freelance"],
      screenshot: "/placeholder.svg?height=300&width=300",
      submittedBy: "user3",
      submittedAt: new Date("2023-03-10"),
      upvotes: 132,
      downvotes: 8,
      averageRating: 4.5,
      viewCount: 2153,
      isPrivate: true,
      isVerified: true,
      status: 'active',
    },
    {
      id: "4",
      name: "Book Club",
      description: "Discuss your favorite books and discover new reads with fellow book lovers.",
      url: "https://facebook.com/groups/book-club",
      size: 7654,
      activityLevel: "Active",
      category: "Books & Literature",
      tags: ["Books", "Reading", "Literature", "Book Club"],
      screenshot: "/placeholder.svg?height=300&width=300",
      submittedBy: "user4",
      submittedAt: new Date("2023-04-05"),
      upvotes: 210,
      downvotes: 3,
      averageRating: 4.8,
      viewCount: 4321,
      isPrivate: false,
      isVerified: true,
      status: 'active',
    },
    {
      id: "5",
      name: "Startup Founders",
      description: "A community for entrepreneurs to share experiences and get advice.",
      url: "https://facebook.com/groups/startup-founders",
      size: 4321,
      activityLevel: "Moderate",
      category: "Business",
      tags: ["Startups", "Entrepreneurship", "Business", "Venture Capital"],
      screenshot: "/placeholder.svg?height=300&width=300",
      submittedBy: "user5",
      submittedAt: new Date("2023-05-12"),
      upvotes: 98,
      downvotes: 7,
      averageRating: 4.3,
      viewCount: 1987,
      isPrivate: true,
      isVerified: false,
      status: 'active',
    },
    {
      id: "6",
      name: "Photography Enthusiasts",
      description: "Share your photography and get feedback from other photographers.",
      url: "https://facebook.com/groups/photography-enthusiasts",
      size: 9876,
      activityLevel: "Very Active",
      category: "Photography",
      tags: ["Photography", "Camera", "DSLR", "Editing"],
      screenshot: "/placeholder.svg?height=300&width=300",
      submittedBy: "user6",
      submittedAt: new Date("2023-06-25"),
      upvotes: 321,
      downvotes: 4,
      averageRating: 4.6,
      viewCount: 6543,
      isPrivate: false,
      isVerified: true,
      status: 'active',
    },
  ]

  // Mock data for categories - would typically come from an API
  const categories: Category[] = [
    { id: "1", name: "Technology", description: "Groups focused on tech innovations and gadgets", groupCount: 342 },
    { id: "2", name: "Health & Wellness", description: "Groups for health tips and wellness advice", groupCount: 256 },
    { id: "3", name: "Travel", description: "Groups for travelers and adventure seekers", groupCount: 189 },
    { id: "4", name: "Books & Literature", description: "Groups for book lovers and literary discussions", groupCount: 142 },
    { id: "5", name: "Business", description: "Groups for entrepreneurs and business professionals", groupCount: 273 },
    { id: "6", name: "Photography", description: "Groups for photography enthusiasts", groupCount: 198 },
    { id: "7", name: "Food & Cooking", description: "Groups for food lovers and cooking enthusiasts", groupCount: 321 },
    { id: "8", name: "Sports & Fitness", description: "Groups for sports fans and fitness enthusiasts", groupCount: 245 },
    { id: "9", name: "Art & Design", description: "Groups for artists and designers", groupCount: 187 },
    { id: "10", name: "Music", description: "Groups for music lovers and musicians", groupCount: 234 },
    { id: "11", name: "Parenting", description: "Groups for parents and childcare", groupCount: 176 },
    { id: "12", name: "Gaming", description: "Groups for gamers and gaming enthusiasts", groupCount: 289 },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4 md:space-y-6">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">Discover Communities That Matter to You</h1>
            <p className="text-muted-foreground md:text-xl max-w-[700px]">
              Find and join Facebook groups that align with your interests, connect with like-minded people, and build
              meaningful relationships.
            </p>

            {/* Search Bar */}
            <form action="/discover" className="w-full max-w-md relative mt-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                name="q"
                placeholder="Search for groups..."
                className="pl-10 h-12 rounded-full border-2 focus:border-primary"
              />
              <Button type="submit" className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full h-10" size="sm">
                Search
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-white">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Browse by Category</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <CategoryPill key={category.id} name={category.name} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Groups Section */}
      <section className="py-12 bg-gray-50">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Featured Groups</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockFeaturedGroups.map((mockGroup) => (
              <GroupCard key={mockGroup.id} group={convertToDbGroup(mockGroup)} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/discover">
              <Button size="lg" className="rounded-full px-8">
                Explore More Groups
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Join Community Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2 space-y-4">
              <h2 className="text-2xl md:text-4xl font-bold">Ready to find your community?</h2>
              <p className="text-blue-100 md:text-lg">
                Join thousands of people who have found their perfect groups and communities.
              </p>
            </div>
            <div className="md:w-1/2 flex justify-center md:justify-end">
              <Link href="/auth/register">
                <Button size="lg" variant="secondary" className="rounded-full px-8">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

