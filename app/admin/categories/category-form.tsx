'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import { Recaptcha } from "@/components/ui/recaptcha";
import { sanitizeInput } from "@/lib/utils";

interface CategoryFormProps {
  id?: string;
  name?: string;
  description?: string;
  isEditing?: boolean;
}

export default function CategoryForm({ 
  id, 
  name = "", 
  description = "", 
  isEditing = false 
}: CategoryFormProps) {
  const router = useRouter();
  const [categoryName, setCategoryName] = useState(name);
  const [categoryDescription, setCategoryDescription] = useState(description);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    setCaptchaError(null);

    // Form validation
    if (!categoryName.trim()) {
      setError("Category name is required");
      setIsSubmitting(false);
      return;
    }

    // Validate CAPTCHA
    if (!captchaToken) {
      setCaptchaError("Please complete the CAPTCHA verification");
      setIsSubmitting(false);
      return;
    }

    try {
      // Sanitize inputs
      const sanitizedName = sanitizeInput(categoryName.trim());
      const sanitizedDescription = categoryDescription ? sanitizeInput(categoryDescription.trim()) : null;
      
      const supabase = createClientComponentClient();
      
      if (isEditing && id) {
        // Update existing category with CAPTCHA verification
        const { error: updateError } = await supabase
          .from("categories")
          .update({ 
            name: sanitizedName, 
            description: sanitizedDescription,
            updated_at: new Date().toISOString(),
            recaptcha_token: captchaToken,
          })
          .eq("id", id);
          
        if (updateError) throw updateError;
      } else {
        // Create new category with CAPTCHA verification
        const { error: insertError } = await supabase
          .from("categories")
          .insert({ 
            name: sanitizedName, 
            description: sanitizedDescription,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            recaptcha_token: captchaToken,
          });
          
        if (insertError) throw insertError;
      }
      
      setSuccess(true);
      setCategoryName("");
      setCategoryDescription("");
      setCaptchaToken(null);
      
      // Redirect after successful creation/update
      setTimeout(() => {
        router.push("/admin/categories");
        router.refresh();
      }, 1500);
      
    } catch (err: any) {
      console.error("Error saving category:", err);
      setError(err.message || "Failed to save category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">
            Category has been {isEditing ? "updated" : "created"} successfully. Redirecting...
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Enter category name"
          disabled={isSubmitting || success}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={categoryDescription}
          onChange={(e) => setCategoryDescription(e.target.value)}
          placeholder="Enter category description"
          rows={4}
          disabled={isSubmitting || success}
        />
      </div>

      <Recaptcha 
        onChange={setCaptchaToken}
        errorMessage={captchaError}
        resetOnError={true}
      />

      <div className="flex space-x-3">
        <Button type="submit" disabled={isSubmitting || success}>
          {isSubmitting ? "Saving..." : isEditing ? "Update Category" : "Create Category"}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.push("/admin/categories")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
} 