'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getSupabaseBrowser } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, ChevronLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database } from '@/lib/database.types';
import { Card, CardContent } from '@/components/ui/card';
import { Recaptcha } from '@/components/ui/recaptcha';
import { AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { sanitizeInput } from '@/lib/utils';

type Category = Database['public']['Tables']['categories']['Row'];
type Tag = Database['public']['Tables']['tags']['Row'];

// Define the form schema with Zod
const formSchema = z.object({
  name: z.string().min(3, { message: 'Group name must be at least 3 characters' }),
  url: z.string().url({ message: 'Please enter a valid URL' }),
  description: z.string()
    .min(50, { message: 'Description must be at least 50 characters' })
    .max(1000, { message: 'Description must be less than 1000 characters' }),
  category_id: z.string({ required_error: 'Please select a category' }),
  tags: z.array(z.string()).optional(),
  size: z.string().optional(),
  activity_level: z.string().optional(),
  is_private: z.boolean().default(false),
  screenshot: z.instanceof(File).optional(),
  terms: z.boolean().refine(val => val === true, { message: 'You must agree to the terms' }),
});

type FormValues = z.infer<typeof formSchema>;

interface SubmitGroupFormProps {
  categories: Category[];
  tags: Tag[];
  userId: string;
}

export default function SubmitGroupForm({ categories, tags, userId }: SubmitGroupFormProps) {
  const router = useRouter();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    category: '',
  });
  
  // Activity levels for dropdown
  const activityLevels = [
    'Very Active',
    'Active',
    'Moderate',
    'Low Activity',
    'Inactive',
  ];
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      url: '',
      description: '',
      category_id: '',
      tags: [],
      size: '',
      activity_level: '',
      is_private: false,
      terms: false,
    },
  });
  
  // Get form values for preview
  const formValues = form.getValues();
  
  // Handle tag addition
  const addTag = () => {
    if (tagInput.trim() !== '' && !selectedTags.includes(tagInput.trim()) && selectedTags.length < 5) {
      const newTags = [...selectedTags, tagInput.trim()];
      setSelectedTags(newTags);
      form.setValue('tags', newTags);
      setTagInput('');
    }
  };
  
  // Handle tag removal
  const removeTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(newTags);
    form.setValue('tags', newTags);
  };
  
  // Handle screenshot change
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        form.setError('screenshot', {
          type: 'manual',
          message: 'Screenshot must be less than 5MB',
        });
        return;
      }
      
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue('screenshot', file);
    }
  };
  
  // Show preview before final submission
  const handleShowPreview = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      setIsPreviewMode(true);
    }
  };
  
  // Go back to edit mode
  const handleBackToEdit = () => {
    setIsPreviewMode(false);
  };
  
  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setCaptchaError(null);
    
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    
    try {
      const supabase = getSupabaseBrowser();
      
      // Upload screenshot if provided
      let screenshotUrl = null;
      if (screenshot) {
        const fileName = `${Math.random().toString(36).substring(2)}.${screenshot.name.split('.').pop()}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('group-screenshots')
          .upload(`public/${fileName}`, screenshot);
        
        if (uploadError) {
          throw uploadError;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('group-screenshots')
          .getPublicUrl(`public/${fileName}`);
        
        screenshotUrl = publicUrl;
      }
      
      // Insert the group
      const { data: newGroup, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: values.name,
          url: values.url,
          description: values.description,
          category_id: values.category_id,
          size: values.size ? parseInt(values.size) : null,
          activity_level: values.activity_level || null,
          screenshot_url: screenshotUrl,
          submitted_by: userId,
          is_private: values.is_private,
          status: 'pending', // New groups start as pending
        })
        .select()
        .single();
      
      if (groupError) {
        throw groupError;
      }
      
      // Add tags if any
      if (selectedTags.length > 0) {
        // First check if tags exist, if not create them
        for (const tagName of selectedTags) {
          // Check if tag exists
          const { data: existingTag } = await supabase
            .from('tags')
            .select('id')
            .eq('name', tagName)
            .maybeSingle();
          
          let tagId;
          if (existingTag) {
            tagId = existingTag.id;
          } else {
            // Create new tag
            const { data: newTag, error: tagError } = await supabase
              .from('tags')
              .insert({ name: tagName })
              .select()
              .single();
            
            if (tagError) throw tagError;
            tagId = newTag.id;
          }
          
          // Link tag to group
          await supabase
            .from('groups_tags')
            .insert({
              group_id: newGroup.id,
              tag_id: tagId,
            });
        }
      }
      
      // Redirect to success page or group detail
      router.push(`/submit/success?id=${newGroup.id}`);
    } catch (err: any) {
      console.error('Error submitting group:', err);
      setError(err.message || 'An error occurred while submitting the group');
      setIsPreviewMode(false); // Go back to edit mode on error
    } finally {
      setLoading(false);
    }
  };
  
  // Get the selected category name
  const getSelectedCategoryName = () => {
    const categoryId = form.getValues('category_id');
    return categories.find(cat => cat.id === categoryId)?.name || 'None';
  };
  
  // If in preview mode, show the preview
  if (isPreviewMode) {
    const values = form.getValues();
    
    return (
      <div className="space-y-6">
        <div className="flex items-center mb-4">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={handleBackToEdit} 
            className="flex items-center"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Edit
          </Button>
        </div>
      
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-1">{values.name}</h2>
            
            <div className="flex items-center mb-4 text-sm text-muted-foreground">
              <Badge className="mr-2">{getSelectedCategoryName()}</Badge>
              {values.is_private && <Badge variant="outline" className="mr-2">Private</Badge>}
              {values.activity_level && <span className="mr-4">Activity: {values.activity_level}</span>}
              {values.size && <span>Size: {parseInt(values.size).toLocaleString()} members</span>}
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-1">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{values.description}</p>
            </div>
            
            {selectedTags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-1">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {screenshotPreview && (
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-1">Screenshot</h3>
                <img 
                  src={screenshotPreview} 
                  alt="Group Screenshot Preview" 
                  className="max-h-60 rounded border" 
                />
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-1">URL</h3>
              <a 
                href={values.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline break-all"
              >
                {values.url}
              </a>
            </div>
          </CardContent>
        </Card>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-end mt-4">
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Group'}
          </Button>
        </div>
      </div>
    );
  }
  
  // Otherwise show the form
  return (
    <form onSubmit={form.handleSubmit(handleShowPreview)} className="space-y-6">
      {/* Group Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Group Name *</Label>
        <Input
          id="name"
          {...form.register('name')}
          placeholder="Enter the exact name of the Facebook group"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
        )}
        <p className="text-sm text-gray-500">
          Please enter the name exactly as it appears on Facebook
        </p>
      </div>
      
      {/* Group URL */}
      <div className="space-y-2">
        <Label htmlFor="url">Group URL *</Label>
        <Input
          id="url"
          {...form.register('url')}
          placeholder="https://facebook.com/groups/..."
        />
        {form.formState.errors.url && (
          <p className="text-sm text-red-500">{form.formState.errors.url.message}</p>
        )}
        <p className="text-sm text-gray-500">
          Enter the full URL of the Facebook group
        </p>
      </div>
      
      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          {...form.register('description')}
          placeholder="Tell us about this group, what type of content is shared, who it's for..."
          rows={4}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
        )}
        <p className="text-sm text-muted-foreground flex justify-between">
          <span>Describe what makes this group valuable</span>
          <span className="text-xs">{form.watch('description')?.length || 0}/1000</span>
        </p>
      </div>
      
      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select
          onValueChange={(value) => form.setValue('category_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.category_id && (
          <p className="text-sm text-red-500">{form.formState.errors.category_id.message}</p>
        )}
      </div>
      
      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">Tags (up to 5)</Label>
        <div className="flex">
          <Input
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add tags that describe the group"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={addTag}
            className="ml-2"
            disabled={selectedTags.length >= 5}
          >
            Add
          </Button>
        </div>
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                {tag}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeTag(tag)}
                />
              </Badge>
            ))}
          </div>
        )}
        <p className="text-sm text-gray-500">
          Add tags to help others find this group
        </p>
      </div>
      
      {/* Group Size */}
      <div className="space-y-2">
        <Label htmlFor="size">Approximate Group Size</Label>
        <Input
          id="size"
          type="number"
          {...form.register('size')}
          placeholder="Number of members"
        />
        <p className="text-sm text-gray-500">
          If you know the group size, enter it here
        </p>
      </div>
      
      {/* Activity Level */}
      <div className="space-y-2">
        <Label htmlFor="activity_level">Activity Level</Label>
        <Select
          onValueChange={(value) => form.setValue('activity_level', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select activity level" />
          </SelectTrigger>
          <SelectContent>
            {activityLevels.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500">
          How active is this group?
        </p>
      </div>
      
      {/* Is Private */}
      <div className="flex items-start space-x-2">
        <Checkbox
          id="is_private"
          onCheckedChange={(checked) => form.setValue('is_private', checked === true)}
        />
        <div>
          <Label htmlFor="is_private" className="text-sm">
            This is a private/closed Facebook group
          </Label>
        </div>
      </div>
      
      {/* Screenshot */}
      <div className="space-y-2">
        <Label htmlFor="screenshot">Group Screenshot (Optional)</Label>
        <Input
          id="screenshot"
          type="file"
          accept="image/*"
          onChange={handleScreenshotChange}
        />
        <p className="text-sm text-gray-500">
          Upload a screenshot of the group (max 5MB)
        </p>
        {form.formState.errors.screenshot && (
          <p className="text-sm text-red-500">{form.formState.errors.screenshot.message as string}</p>
        )}
        {screenshotPreview && (
          <div className="relative mt-2 inline-block">
            <img 
              src={screenshotPreview} 
              alt="Group Screenshot Preview" 
              className="max-h-40 rounded border" 
            />
            <button
              type="button"
              onClick={() => {
                setScreenshot(null);
                setScreenshotPreview(null);
              }}
              className="absolute top-1 right-1 bg-white p-1 rounded-full shadow"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      
      {/* Terms Agreement */}
      <div className="flex items-start space-x-2 pt-4">
        <Checkbox
          id="terms"
          onCheckedChange={(checked) => form.setValue('terms', checked === true)}
        />
        <div>
          <Label htmlFor="terms" className="text-sm">
            I confirm that I have permission to share this group and the information 
            provided is accurate.
          </Label>
          {form.formState.errors.terms && (
            <p className="text-sm text-red-500">{form.formState.errors.terms.message}</p>
          )}
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Recaptcha 
        onChange={setCaptchaToken}
        errorMessage={captchaError}
        resetOnError={true}
      />
      
      <Button type="submit" className="w-full" disabled={loading}>
        Preview Submission
      </Button>
    </form>
  );
}

function validateForm() {
  const newErrors: Record<string, string> = {};
  
  if (!formData.name.trim()) {
    newErrors.name = 'Group name is required';
  }
  
  if (!formData.url.trim()) {
    newErrors.url = 'URL is required';
  } else if (!formData.url.includes('facebook.com/groups/')) {
    newErrors.url = 'Must be a valid Facebook group URL';
  }
  
  if (!formData.description.trim()) {
    newErrors.description = 'Description is required';
  } else if (formData.description.length < 50) {
    newErrors.description = 'Description must be at least 50 characters';
  }
  
  if (!formData.category.trim()) {
    newErrors.category = 'Category is required';
  }
  
  // Only require CAPTCHA if reCAPTCHA is configured
  const recaptchaEnabled = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY.trim() !== '';
  if (recaptchaEnabled && !captchaToken) {
    setCaptchaError('Please complete the CAPTCHA verification');
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0 && (!recaptchaEnabled || captchaToken !== null);
} 