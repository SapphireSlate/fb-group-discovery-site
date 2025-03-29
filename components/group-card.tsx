import Image from "next/image"
import { Lock, Users, MessageSquare, ThumbsUp, ThumbsDown, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { Database } from "@/lib/database.types"

type Group = Database['public']['Tables']['groups']['Row'] & {
  categories?: Database['public']['Tables']['categories']['Row'] | null;
  // For tags, since they can be null from the join
  groups_tags?: { tag_id: string }[] | null;
};

interface GroupCardProps {
  group: Group;
}

export default function GroupCard({ group }: GroupCardProps) {
  // Helper function to render rating stars
  const renderStars = (rating: number = 0) => {
    return Array.from({ length: Math.min(5, Math.round(rating)) }).map((_, i) => (
      <Star key={i} className="h-3 w-3 text-yellow-400 fill-yellow-400" />
    ));
  };
  
  // Set default value for average_rating if undefined
  const averageRating = group.average_rating || 0;
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative h-48 w-full">
        <Image 
          src={group.screenshot_url || "/placeholder.svg"} 
          alt={group.name} 
          fill 
          className="object-cover" 
        />
        <div className="absolute top-3 right-3">
          <Badge variant={group.is_private ? "secondary" : "default"}>
            {group.is_private ? (
              <span className="flex items-center">
                <Lock className="mr-1 h-3 w-3" /> Private
              </span>
            ) : (
              "Public"
            )}
          </Badge>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <Badge variant="outline" className="bg-white/20 text-white border-none">
            {group.categories?.name || "Uncategorized"}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-1">{group.name}</h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{group.description}</p>
        <div className="flex items-center text-xs text-muted-foreground space-x-4">
          <div className="flex items-center">
            <Users className="h-3 w-3 mr-1" />
            <span>{group.size?.toLocaleString() || "Unknown"} members</span>
          </div>
          <div className="flex items-center">
            <ThumbsUp className="h-3 w-3 mr-1" />
            <span>{group.upvotes}</span>
          </div>
          <div className="flex items-center">
            <div className="flex mr-1">
              {renderStars(averageRating)}
            </div>
            <span>{averageRating.toFixed(1)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Link href={`/group/${group.id}`}>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </Link>
        <a href={group.url} target="_blank" rel="noopener noreferrer">
          <Button size="sm">Join Group</Button>
        </a>
      </CardFooter>
    </Card>
  )
}

