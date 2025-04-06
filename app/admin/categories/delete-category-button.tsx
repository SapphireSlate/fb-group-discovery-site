'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';

interface DeleteCategoryButtonProps {
  categoryId: string;
  categoryName: string;
  groupCount: number;
}

export default function DeleteCategoryButton({
  categoryId,
  categoryName,
  groupCount,
}: DeleteCategoryButtonProps) {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  
  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      // Check if the category has groups
      if (groupCount > 0) {
        // Show warning toast
        toast({
          title: 'Cannot delete category',
          description: `This category contains ${groupCount} groups. You must reassign or delete these groups first.`,
          variant: 'destructive',
        });
        setShowDialog(false);
        return;
      }
      
      // Delete the category
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);
        
      if (error) throw new Error(error.message);
      
      toast({
        title: 'Category deleted',
        description: `${categoryName} has been deleted successfully.`,
      });
      
      // Refresh the page to show the update
      router.refresh();
      router.push('/admin/categories');
    } catch (error) {
      console.error('Error deleting category:', error);
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete category',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDialog(false);
    }
  };
  
  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this category?</AlertDialogTitle>
          <AlertDialogDescription>
            {groupCount > 0 ? (
              <div className="text-red-600 font-medium">
                Warning: This category contains {groupCount} groups. You must reassign or delete these groups first.
              </div>
            ) : (
              <>
                This will permanently delete the "{categoryName}" category.
                This action cannot be undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className={`bg-red-600 hover:bg-red-700 focus:ring-red-600 ${groupCount > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isDeleting || groupCount > 0}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Category'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 