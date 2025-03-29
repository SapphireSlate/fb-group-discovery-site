'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Category = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  group_count: number;
};

type Tag = {
  id: string;
  name: string;
};

interface DiscoverFiltersProps {
  categories: Category[];
  tags: Tag[];
  activityLevels: string[];
  initialCategory: string;
  initialTags: string[];
  initialActivity: string;
  initialSort: string;
}

export function DiscoverFilters({
  categories,
  tags,
  activityLevels,
  initialCategory,
  initialTags,
  initialActivity,
  initialSort
}: DiscoverFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [activityLevel, setActivityLevel] = useState(initialActivity);
  const [sortBy, setSortBy] = useState(initialSort);
  
  // Update URL when filters change
  const updateFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update category
    if (selectedCategory && selectedCategory !== "all") {
      params.set('category', selectedCategory);
    } else {
      params.delete('category');
    }
    
    // Update tags
    if (selectedTags.length > 0) {
      params.set('tags', selectedTags.join(','));
    } else {
      params.delete('tags');
    }
    
    // Update activity level
    if (activityLevel && activityLevel !== "all") {
      params.set('activity', activityLevel);
    } else {
      params.delete('activity');
    }
    
    // Update sorting
    if (sortBy) {
      params.set('sort', sortBy);
    } else {
      params.delete('sort');
    }
    
    // Reset to page 1 when filters change
    params.set('page', '1');
    
    // Preserve search query if it exists
    const q = searchParams.get('q');
    if (q) {
      params.set('q', q);
    }
    
    router.push(`/discover?${params.toString()}`);
  };
  
  // Update when individual filters change
  useEffect(() => {
    updateFilters();
  }, [selectedCategory, selectedTags, activityLevel, sortBy]);
  
  // Handle tag selection
  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };
  
  // Remove a selected tag
  const removeTag = (tagId: string) => {
    setSelectedTags(prev => prev.filter(id => id !== tagId));
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedTags([]);
    setActivityLevel('all');
    setSortBy('newest');
  };
  
  // Get tag name by ID
  const getTagName = (tagId: string) => {
    return tags.find(tag => tag.id === tagId)?.name || '';
  };

  return (
    <>
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Category filter */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Tags filter */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  Select Tags
                  {selectedTags.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedTags.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter by Tags</SheetTitle>
                  <SheetDescription>
                    Select one or more tags to filter groups
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                  {tags?.map((tag) => (
                    <div key={tag.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`tag-${tag.id}`} 
                        checked={selectedTags.includes(tag.id)}
                        onCheckedChange={() => handleTagToggle(tag.id)}
                      />
                      <Label htmlFor={`tag-${tag.id}`} className="flex-1 cursor-pointer">
                        {tag.name}
                      </Label>
                    </div>
                  ))}
                </div>
                <SheetFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedTags([])}
                  >
                    Clear All
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Activity level filter */}
          <div className="space-y-2">
            <Label>Activity Level</Label>
            <Select
              value={activityLevel}
              onValueChange={setActivityLevel}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any Activity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Activity</SelectItem>
                {activityLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Clear filters button */}
          <Button
            variant="ghost"
            className="w-full"
            onClick={clearAllFilters}
          >
            Clear All Filters
          </Button>
        </CardContent>
      </Card>
      
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {selectedTags.map(tagId => (
            <Badge key={tagId} variant="secondary" className="flex items-center gap-1">
              {getTagName(tagId)}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeTag(tagId)} 
              />
            </Badge>
          ))}
        </div>
      )}
    </>
  );
}

export function SortSelector({ initialSort }: { initialSort: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('sort', value);
    } else {
      params.delete('sort');
    }
    router.push(`/discover?${params.toString()}`);
  };

  return (
    <Select
      defaultValue={initialSort}
      onValueChange={handleSortChange}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">Newest</SelectItem>
        <SelectItem value="popular">Most Popular</SelectItem>
        <SelectItem value="top-rated">Top Rated</SelectItem>
        <SelectItem value="most-upvoted">Most Upvoted</SelectItem>
      </SelectContent>
    </Select>
  );
} 