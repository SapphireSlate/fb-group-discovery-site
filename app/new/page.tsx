import { Button } from "@/components/ui/button"
import GroupCard from "@/components/group-card"
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"
import { createServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { Database } from '@/lib/database.types'
import Link from 'next/link'

// Define the group type with extended properties
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

export default async function NewGroupsPage() {
  // Create Supabase client
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);
  
  // Fetch new groups - sorted by most recently submitted
  const { data: newGroups, error } = await supabase
    .from('groups')
    .select(`
      *,
      categories:category_id(*)
    `)
    .eq('status', 'active')
    .order('submitted_at', { ascending: false })
    .limit(12)
  
  if (error) {
    console.error('Error fetching new groups:', error)
  }

  // We also need to fetch tags for these groups
  let groupsWithTags: GroupWithRelations[] = [];
  
  if (newGroups && newGroups.length > 0) {
    // Get all group IDs
    const groupIds = newGroups.map(group => group.id);
    
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
    groupsWithTags = newGroups.map(group => ({
      ...group,
      groups_tags: tagsByGroup.get(group.id) || null
    }));
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto py-6 px-4">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold">New Facebook Groups</h1>
              <p className="text-muted-foreground mt-1">
                Most recently added Facebook groups to our directory
              </p>
            </div>
            
            <div>
              <Link href="/discover">
                <Button variant="outline">
                  Browse All Groups
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="mt-8">
            {groupsWithTags && groupsWithTags.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupsWithTags.map((group) => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No new groups found</h3>
                <p className="text-muted-foreground mt-2">
                  Check back later for new group submissions or browse all groups.
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