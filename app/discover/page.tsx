import { Search, Filter, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GroupCard from "@/components/group-card"
import CategoryPill from "@/components/category-pill"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { Database } from '@/lib/database.types'
import { DiscoverFilters, SortSelector } from './filters'
import Link from 'next/link'
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"

type Group = Database['public']['Tables']['groups']['Row']
type Category = Database['public']['Tables']['categories']['Row']
type Tag = Database['public']['Tables']['tags']['Row']

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: { 
    q?: string; 
    category?: string; 
    tags?: string; 
    activity?: string;
    sort?: string;
    page?: string;
  }
}) {
  // Extract query parameters
  const searchQuery = String(searchParams?.q || '');
  const selectedCategory = String(searchParams?.category || 'all');
  const selectedTags = searchParams?.tags ? String(searchParams.tags).split(',') : [];
  const activityLevel = String(searchParams?.activity || 'all');
  const sortBy = String(searchParams?.sort || 'newest');
  const currentPage = parseInt(String(searchParams?.page || '1'));
  const itemsPerPage = 12;
  
  // Create Supabase client
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);
  
  // Fetch categories for filtering
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  
  // Fetch tags for filtering
  const { data: tagsList } = await supabase
    .from('tags')
    .select('*')
    .order('name')
  
  // Build query for groups
  let query = supabase
    .from('groups')
    .select(`
      *,
      categories:category_id(name),
      groups_tags!inner(tag_id)
    `)
    .eq('status', 'active')
    .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)
  
  // Apply search if provided
  if (searchQuery) {
    query = query.textSearch('search_vector', searchQuery, {
      type: 'websearch',
      config: 'english'
    })
  }
  
  // Apply category filter if provided - make sure it's a valid UUID and not 'all'
  if (selectedCategory && selectedCategory !== 'all') {
    // Only apply the filter if it's not 'all' and is a valid UUID format
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(selectedCategory);
    if (isValidUuid) {
      query = query.eq('category_id', selectedCategory);
    }
  }
  
  // Apply activity level filter if provided
  if (activityLevel && activityLevel !== 'all') {
    query = query.eq('activity_level', activityLevel)
  }
  
  // Apply sorting
  if (sortBy === 'newest') {
    query = query.order('submitted_at', { ascending: false })
  } else if (sortBy === 'popular') {
    query = query.order('view_count', { ascending: false })
  } else if (sortBy === 'top-rated') {
    query = query.order('average_rating', { ascending: false })
  } else if (sortBy === 'most-upvoted') {
    query = query.order('upvotes', { ascending: false })
  }
  
  // Execute query
  const { data: groups, error, count } = await query
  
  if (error) {
    console.error('Error fetching groups:', error)
  }
  
  // Further filter by tags if needed (we do this in JS since it's a many-to-many relationship)
  let filteredGroups = groups || []
  
  if (selectedTags.length > 0) {
    // For tags, we need to fetch the groups_tags relationships
    const { data: groupTags } = await supabase
      .from('groups_tags')
      .select('group_id, tags!inner(id, name)')
      .in('tag_id', selectedTags)
    
    // Create a map of group IDs to their tags
    const groupTagMap = new Map();
    groupTags?.forEach((item: any) => {
      if (!groupTagMap.has(item.group_id)) {
        groupTagMap.set(item.group_id, []);
      }
      groupTagMap.get(item.group_id).push(item.tags);
    });
    
    // Filter groups to only include those with ALL selected tags
    filteredGroups = filteredGroups.filter((group: any) => {
      const groupTagIds = groupTagMap.get(group.id) || [];
      return selectedTags.every(tagId => 
        groupTagIds.some((tag: Tag) => tag.id === tagId)
      );
    });
  }
  
  // Fetch total count for pagination
  const { count: totalCount } = await supabase
    .from('groups')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
  
  const totalPages = Math.ceil((totalCount || 0) / itemsPerPage)
  
  // Activity level options for filter
  const activityLevels = [
    'Very Active',
    'Active',
    'Moderate',
    'Low Activity',
    'Inactive',
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto py-6 px-4">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold">Discover Facebook Groups</h1>
              <p className="text-muted-foreground mt-1">
                Browse and search for valuable Facebook groups
              </p>
            </div>
            
            {/* Search form */}
            <div className="flex w-full md:w-auto">
              <form className="flex-1 md:w-80" action="/discover" method="get">
                {/* Preserve existing filters when searching */}
                {selectedCategory && selectedCategory !== 'all' && (
                  <input type="hidden" name="category" value={selectedCategory} />
                )}
                {selectedTags.length > 0 && (
                  <input type="hidden" name="tags" value={selectedTags.join(',')} />
                )}
                {activityLevel && activityLevel !== 'all' && (
                  <input type="hidden" name="activity" value={activityLevel} />
                )}
                {sortBy && (
                  <input type="hidden" name="sort" value={sortBy} />
                )}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    name="q"
                    placeholder="Search groups..."
                    className="w-full pl-8 pr-12"
                    defaultValue={searchQuery}
                  />
                  <Button type="submit" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3">
                    Search
                  </Button>
                </div>
              </form>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6 mt-6">
            {/* Filters */}
            <div className="w-full lg:w-64 space-y-4">
              <DiscoverFilters 
                categories={categories || []}
                tags={tagsList || []}
                activityLevels={activityLevels}
                initialCategory={selectedCategory}
                initialTags={selectedTags}
                initialActivity={activityLevel}
                initialSort={sortBy}
              />
            </div>
            
            {/* Main content */}
            <div className="flex-1">
              {/* Sort and view options */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 mb-6">
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground mr-2">Sort by:</span>
                  <SortSelector initialSort={sortBy} />
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Showing {filteredGroups.length} of {totalCount || 0} groups
                </div>
              </div>
              
              {/* Results */}
              {filteredGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredGroups.map((group: any) => (
                    <GroupCard key={group.id} group={group} />
                  ))}
                </div>
              ) : (
                <Card className="w-full">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <h3 className="font-medium text-lg mb-2">No groups found</h3>
                    <p className="text-muted-foreground text-center mb-6">
                      We couldn't find any groups matching your filters.
                    </p>
                    <Button asChild>
                      <Link href="/discover">Clear Filters</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex space-x-2">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNum = i + 1;
                      const isCurrent = pageNum === currentPage;
                      
                      // Create URL for this page, preserving all current filters
                      const url = new URL(typeof window !== 'undefined' ? window.location.href : 'http://localhost');
                      url.searchParams.set('page', pageNum.toString());
                      
                      return (
                        <Link 
                          key={pageNum}
                          href={`/discover?${url.searchParams.toString()}`}
                          aria-current={isCurrent ? "page" : undefined}
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-md text-sm ${
                            isCurrent
                              ? "bg-primary text-primary-foreground"
                              : "bg-background hover:bg-accent hover:text-accent-foreground"
                          }`}
                        >
                          {pageNum}
                        </Link>
                      );
                    })}
                    {totalPages > 5 && <span className="inline-flex h-9 items-center justify-center px-2">...</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

