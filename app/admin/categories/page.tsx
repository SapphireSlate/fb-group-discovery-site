import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Edit, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import CategoryForm from './category-form';

export default async function AdminCategoriesPage() {
  // Check if user is authorized
  const user = await requireAuth();
  
  const supabase = await createServerClient();
  
  // Get the user's profile to check admin status
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .single();
  
  // Check admin status
  const isAdmin = profile?.is_admin || false;
  
  if (!isAdmin) {
    redirect('/'); // Redirect non-admins
  }
  
  // Fetch categories
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
    
  if (error) {
    console.error('Error fetching categories:', error);
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-1">Category Management</h1>
      <p className="text-muted-foreground mb-6">Create and manage categories for organizing groups</p>
      
      {/* Main Content */}
      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="add">Add New Category</TabsTrigger>
        </TabsList>
        
        {/* Categories List Tab */}
        <TabsContent value="categories">
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <h2 className="font-medium mb-2">Manage Categories</h2>
            <p className="text-muted-foreground text-sm">
              Categories are used to organize and filter groups. You can edit or delete existing categories.
            </p>
          </div>
          
          {categories && categories.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Icon</TableHead>
                    <TableHead>Groups</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="font-medium">{category.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {category.description || 'No description'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {category.icon ? (
                          <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                            <span className="text-lg">{category.icon}</span>
                          </div>
                        ) : (
                          <div className="text-muted-foreground text-sm">No icon</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {category.group_count || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/admin/categories/${category.id}`}>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                          {/* "Delete" button would go here - using a client component */}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium">No categories found</h3>
              <p className="text-muted-foreground mt-1">
                Create a new category to get started
              </p>
              <Button className="mt-4" variant="default">
                <Plus className="h-4 w-4 mr-1" />
                Add Category
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Add New Category Tab */}
        <TabsContent value="add">
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <h2 className="font-medium mb-2">Add New Category</h2>
            <p className="text-muted-foreground text-sm">
              Create a new category to organize groups. Categories should be descriptive and easy to understand.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Details</CardTitle>
                <CardDescription>
                  Enter the information for the new category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryForm />
              </CardContent>
            </Card>
            
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Guidelines</CardTitle>
                  <CardDescription>
                    Tips for creating effective categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                      <span>Use clear, descriptive names that users will easily understand</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                      <span>Provide a concise but informative description</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                      <span>Choose an appropriate icon that represents the category</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                      <span>Avoid creating overly broad or overly specific categories</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                      <span>Check for duplicate categories before creating new ones</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Category Examples</CardTitle>
                  <CardDescription>
                    Examples of well-structured categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="font-medium">Technology</div>
                      <div className="text-sm text-muted-foreground">
                        Groups focused on technology, programming, gadgets, and digital innovation
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Small Business</div>
                      <div className="text-sm text-muted-foreground">
                        Communities for small business owners, entrepreneurs, and freelancers
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Health & Wellness</div>
                      <div className="text-sm text-muted-foreground">
                        Groups about physical health, mental wellbeing, fitness, and nutrition
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 