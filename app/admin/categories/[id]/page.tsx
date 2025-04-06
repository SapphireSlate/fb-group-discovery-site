import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CategoryForm from '../category-form';

interface EditCategoryPageProps {
  params: {
    id: string;
  };
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  // Check if user is authorized
  const user = await requireAuth();
  
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);
  
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
  
  // Fetch the category
  const { data: category, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', params.id)
    .single();
    
  if (error || !category) {
    return (
      <div className="container mx-auto py-6">
        <Link href="/admin/categories">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Button>
        </Link>
        
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-4 flex items-start">
          <AlertCircle className="h-5 w-5 mr-3 mt-0.5" />
          <div>
            <h3 className="font-medium">Category not found</h3>
            <p className="text-sm mt-1">
              The category you are trying to edit does not exist or you don't have permission to access it.
            </p>
            <Button 
              variant="outline" 
              className="mt-3" 
              size="sm" 
              asChild
            >
              <Link href="/admin/categories">Return to Categories</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Link href="/admin/categories">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Categories
        </Button>
      </Link>
      
      <h1 className="text-3xl font-bold mb-1">Edit Category</h1>
      <p className="text-muted-foreground mb-6">Update the details for {category.name}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
            <CardDescription>
              Edit the information for this category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryForm 
              initialData={{
                id: category.id,
                name: category.name,
                description: category.description || '',
                icon: category.icon || ''
              }}
              mode="edit"
            />
          </CardContent>
        </Card>
        
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Category Statistics</CardTitle>
              <CardDescription>
                Usage metrics for this category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Groups in this category</dt>
                  <dd className="text-2xl font-bold">{category.group_count || 0}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Created</dt>
                  <dd className="font-medium">
                    {new Date(category.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Guidelines</CardTitle>
              <CardDescription>
                Tips for updating categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <span>Changing a category name may confuse users who are familiar with the existing name</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <span>Consider the impact on existing groups before making significant changes</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <span>Make sure the description clearly defines what belongs in this category</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 