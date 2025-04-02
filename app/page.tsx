import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import GroupCard from "@/components/group-card"
import CategoryPill from "@/components/category-pill"
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import { createServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { Database } from '@/lib/database.types'

type GroupWithRelations = Database['public']['Tables']['groups']['Row'] & {
  categories?: { 
    id: string; 
    name: string; 
    description: string | null; 
    icon: string | null; 
    group_count: number; 
  } | null;
  groups_tags?: { tag_id: string; }[] | null;
};

export default async function Home() {
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);
  
  // Fetch featured groups (highest rated)
  const { data: featuredGroups, error: featuredError } = await supabase
    .from('groups')
    .select(`
      *,
      categories:category_id(*)
    `)
    .eq('status', 'active')
    .order('average_rating', { ascending: false })
    .limit(6);
  
  if (featuredError) {
    console.error('Error fetching featured groups:', featuredError);
  }
  
  // Fetch categories
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError);
  }
  
  // We also need to fetch tags for the featured groups
  let groupsWithTags: GroupWithRelations[] = [];
  
  if (featuredGroups && featuredGroups.length > 0) {
    // Get all group IDs
    const groupIds = featuredGroups.map(group => group.id);
    
    // Fetch tags for these groups
    const { data: groupsTags } = await supabase
      .from('groups_tags')
      .select('group_id, tag_id')
      .in('group_id', groupIds);
    
    // Group the tags by group_id
    const tagsByGroup = new Map<string, { tag_id: string }[]>();
    groupsTags?.forEach(item => {
      if (!tagsByGroup.has(item.group_id)) {
        tagsByGroup.set(item.group_id, []);
      }
      tagsByGroup.get(item.group_id)?.push({ tag_id: item.tag_id });
    });
    
    // Add tags to each group
    groupsWithTags = featuredGroups.map(group => ({
      ...group,
      groups_tags: tagsByGroup.get(group.id) || null
    }));
  }

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
            {categories && categories.length > 0 ? (
              categories.map((category) => (
                <CategoryPill key={category.id} name={category.name} />
              ))
            ) : (
              <p className="text-muted-foreground">Loading categories...</p>
            )}
          </div>
        </div>
      </section>

      {/* Featured Groups Section */}
      <section className="py-12 bg-gray-50">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Featured Groups</h2>
          {groupsWithTags && groupsWithTags.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupsWithTags.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No featured groups found.</p>
            </div>
          )}
          <div className="mt-10 text-center">
            <Link href="/discover">
              <Button size="lg" className="rounded-full px-8">
                Explore More Groups
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Join Thousands of Satisfied Users</h2>
            <div className="bg-gray-50 border rounded-lg p-6 md:p-8 mb-6">
              <p className="italic text-muted-foreground mb-4">
                "I've discovered so many valuable professional groups through this platform. It's completely changed how I network and learn from industry peers."
              </p>
              <div className="font-medium">Sarah T., Marketing Professional</div>
            </div>
            <Link href="/discover">
              <Button variant="outline" className="rounded-full px-8">
                Start Discovering Groups
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/90 to-primary text-white">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Find Your Community?</h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            Join our platform today to discover Facebook groups that match your interests and connect with like-minded people from around the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/discover">
              <Button size="lg" variant="secondary" className="rounded-full px-8">
                Explore Groups
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="lg" variant="outline" className="rounded-full px-8 bg-transparent hover:bg-white/10 text-white border-white">
                Sign Up Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

