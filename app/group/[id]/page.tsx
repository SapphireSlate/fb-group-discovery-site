import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, Users, Calendar, Lock, MessageSquare, Share2, Bell, Flag, Star, ThumbsUp, ThumbsDown, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { createServerClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { Database } from '@/lib/database.types'
import GroupVoteButtons from './vote-buttons'
import ReviewForm from './review-form'
import RelatedGroups from './related-groups'
import ReportButtonClient from './report-button-client'

type Group = Database['public']['Tables']['groups']['Row'] & {
  categories?: Database['public']['Tables']['categories']['Row'];
  users?: Database['public']['Tables']['users']['Row'];
  verified_by_user?: Database['public']['Tables']['users']['Row'];
}

type Review = Database['public']['Tables']['reviews']['Row'] & {
  users: Database['public']['Tables']['users']['Row']
}

export default async function GroupPage({ params }: { params: { id: string } }) {
  const supabase = await createServerClient()
  
  // Fetch group data
  const { data: group, error } = await supabase
    .from('groups')
    .select(`
      *,
      categories:category_id(*),
      users!submitted_by(*),
      verified_by_user:verified_by(*)
    `)
    .eq('id', params.id)
    .single()
  
  if (error || !group) {
    console.error('Error fetching group:', error)
    notFound()
  }
  
  // Increment view count
  await supabase
    .from('groups')
    .update({ view_count: (group.view_count || 0) + 1 })
    .eq('id', params.id)
  
  // Fetch group tags
  const { data: groupTags } = await supabase
    .from('groups_tags')
    .select(`
      tags(*)
    `)
    .eq('group_id', params.id)
  
  const tags = groupTags?.map(item => item.tags) || []
  
  // Fetch reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      users:user_id(*)
    `)
    .eq('group_id', params.id)
    .order('created_at', { ascending: false })
  
  // Get current user for review form and voting
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  
  // If user is authenticated, fetch user profile
  let userProfile = null
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .single()
    
    userProfile = profile
  }
  
  // Check if user has already reviewed this group
  const hasReviewed = userProfile && reviews?.some(review => review.user_id === userProfile?.id)
  
  // Check if user has already voted for this group
  let userVote = null
  if (userProfile) {
    const { data: voteData } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('group_id', params.id)
      .eq('user_id', userProfile.id)
      .maybeSingle()
    
    userVote = voteData?.vote_type
  }
  
  // Helper function to render rating stars
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-yellow-400' 
            : i < rating 
              ? 'text-yellow-400 fill-yellow-400 opacity-50' 
              : 'text-gray-300'
        }`}
      />
    ))
  }
  
  // Format date using localized strings
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link 
          href="/discover" 
          className="inline-flex items-center text-sm font-medium text-primary hover:underline"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Groups
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Group header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold">{group.name}</h1>
                  {group.verification_status === 'verified' && (
                    <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center mt-2 space-x-4">
                  <div className="flex items-center">
                    {renderStars(group.average_rating)}
                    <span className="ml-2 text-sm text-muted-foreground">
                      {group.average_rating.toFixed(1)} ({reviews?.length || 0} reviews)
                    </span>
                  </div>
                  
                  <Badge variant={group.is_private ? "secondary" : "outline"}>
                    {group.is_private ? (
                      <span className="flex items-center">
                        <Lock className="mr-1 h-3 w-3" /> Private
                      </span>
                    ) : (
                      "Public"
                    )}
                  </Badge>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="mr-1 h-4 w-4" />
                    {group.size?.toLocaleString() || "Unknown"} members
                  </div>
                </div>
              </div>
              
              <div>
                <a 
                  href={group.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button>Join Group</Button>
                </a>
              </div>
            </div>
            
            {/* Add verification info if verified */}
            {group.verification_status === 'verified' && group.verification_date && (
              <div className="bg-green-50 border border-green-100 rounded-md p-3 mt-3">
                <h3 className="text-sm font-medium text-green-800 flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verified Group
                </h3>
                <div className="text-xs text-green-700 mt-1">
                  <p>This group has been verified by our team on {new Date(group.verification_date).toLocaleDateString()}</p>
                  {group.verified_by_user && (
                    <p className="mt-1">Verified by: {group.verified_by_user.display_name}</p>
                  )}
                </div>
              </div>
            )}
            
            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-100">
              {group.screenshot_url ? (
                <Image 
                  src={group.screenshot_url} 
                  alt={group.name} 
                  fill 
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No screenshot available
                </div>
              )}
            </div>
          </div>
          
          {/* Tabs for information */}
          <Tabs defaultValue="about">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviews?.length || 0})</TabsTrigger>
              <TabsTrigger value="related">Related Groups</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="space-y-4 pt-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">{group.description}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Category</h3>
                <Badge variant="outline" className="text-sm">
                  {group.categories?.name || "Uncategorized"}
                </Badge>
              </div>
              
              {tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag: any) => (
                      <Link 
                        key={tag.id} 
                        href={`/discover?tags=${tag.id}`}
                      >
                        <Badge variant="secondary" className="cursor-pointer">
                          {tag.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-medium mb-2">Activity Level</h3>
                <p className="text-muted-foreground">
                  {group.activity_level || "Not specified"}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Facebook URL</h3>
                <a 
                  href={group.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-500 hover:underline break-all"
                >
                  {group.url}
                </a>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Submitted By</h3>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                    {group.users?.avatar_url ? (
                      <Image 
                        src={group.users.avatar_url} 
                        alt={group.users.display_name} 
                        width={32} 
                        height={32} 
                        className="rounded-full"
                      />
                    ) : (
                      <span className="text-sm">{group.users?.display_name?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{group.users?.display_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Submitted on {formatDate(group.submitted_at)}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="space-y-6 pt-4">
              {/* Review form */}
              {userProfile && !hasReviewed ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Write a Review</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReviewForm 
                      groupId={group.id} 
                      userId={userProfile.id} 
                    />
                  </CardContent>
                </Card>
              ) : !userProfile ? (
                <Card>
                  <CardContent className="text-center py-6">
                    <p className="mb-4">Sign in to write a review</p>
                    <Link href="/auth/login">
                      <Button>Sign In</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : null}
              
              {/* Reviews list */}
              {reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between mb-2">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                              {review.users?.avatar_url ? (
                                <Image 
                                  src={review.users.avatar_url} 
                                  alt={review.users.display_name} 
                                  width={32} 
                                  height={32} 
                                  className="rounded-full"
                                />
                              ) : (
                                <span className="text-sm">{review.users?.display_name?.charAt(0) || 'U'}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{review.users?.display_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(review.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {renderStars(review.rating)}
                            </div>
                            
                            {/* Add edit/delete buttons if the review belongs to the current user */}
                            {userProfile && review.user_id === userProfile.id && (
                              <div className="flex items-center gap-1 ml-2">
                                <Link href={`/review/edit/${review.id}?groupId=${group.id}`}>
                                  <Button variant="ghost" size="sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                  </Button>
                                </Link>
                                <Link href={`/review/delete/${review.id}?groupId=${group.id}`}>
                                  <Button variant="ghost" size="sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                  </Button>
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="mt-2 text-muted-foreground">{review.comment}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No reviews yet</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="related" className="pt-4">
              <RelatedGroups groupId={group.id} />
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Voting card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rate this Group</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <GroupVoteButtons 
                  groupId={group.id} 
                  upvotes={group.upvotes} 
                  downvotes={group.downvotes} 
                  currentVote={userVote}
                  userId={userProfile?.id}
                />
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                {group.upvotes - group.downvotes >= 0 
                  ? `${group.upvotes - group.downvotes} people found this group helpful` 
                  : `${Math.abs(group.upvotes - group.downvotes)} people did not find this group helpful`
                }
              </div>
            </CardContent>
          </Card>
          
          {/* Share card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Share this Group</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                
                <a 
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out this Facebook group: ${group.name}`)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Tweet
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
          
          {/* Report card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Report</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                See something wrong with this group listing?
              </p>
              {userProfile ? (
                <ReportButtonClient 
                  groupId={group.id} 
                  groupName={group.name} 
                  userId={userProfile.id} 
                />
              ) : (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Sign in to report this group</p>
                  <Link href="/auth/login">
                    <Button variant="outline" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Group stats card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Group Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Views</span>
                <span className="font-medium">{group.view_count}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Upvotes</span>
                <span className="font-medium">{group.upvotes}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Downvotes</span>
                <span className="font-medium">{group.downvotes}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rating</span>
                <span className="font-medium">{group.average_rating.toFixed(1)}/5</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reviews</span>
                <span className="font-medium">{reviews?.length || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Submitted</span>
                <span className="font-medium">{formatDate(group.submitted_at)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

