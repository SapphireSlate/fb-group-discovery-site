import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Recaptcha } from '@/components/ui/recaptcha';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { validateGroupSubmission } from '@/lib/validation';
import { sanitizeInput } from '@/lib/utils';

export default function GroupSubmissionForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    category: '',
  });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    setErrors({});
    setCaptchaError(null);

    // Validate captcha
    if (!captchaToken) {
      setCaptchaError('Please complete the CAPTCHA verification');
      setIsSubmitting(false);
      return;
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(formData.name),
      description: sanitizeInput(formData.description),
      url: sanitizeInput(formData.url),
      category: sanitizeInput(formData.category),
    };

    // Validate form data
    const validation = validateGroupSubmission(sanitizedData);
    
    if (!validation.success) {
      // Set validation errors
      const formErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        formErrors[err.path[0]] = err.message;
      });
      setErrors(formErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...sanitizedData,
          captchaToken
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.error === 'INVALID_CAPTCHA') {
          setCaptchaError('CAPTCHA verification failed. Please try again.');
        } else {
          setError(data.error || 'Failed to submit group. Please try again.');
        }
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
      setFormData({
        name: '',
        description: '',
        url: '',
        category: '',
      });
      setCaptchaToken(null);
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
      console.error('Group submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
    if (token) {
      setCaptchaError(null);
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
            Your group submission has been received and will be reviewed shortly.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Group Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter the Facebook group name"
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">Group URL</Label>
        <Input
          id="url"
          name="url"
          value={formData.url}
          onChange={handleChange}
          placeholder="https://facebook.com/groups/example"
          className={errors.url ? 'border-red-500' : ''}
        />
        {errors.url && <p className="text-red-500 text-sm mt-1">{errors.url}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="E.g. Technology, Fitness, Education"
          className={errors.category ? 'border-red-500' : ''}
        />
        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Provide a brief description of what this group is about"
          rows={4}
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      <Recaptcha 
        onChange={handleCaptchaChange} 
        errorMessage={captchaError}
        resetOnError={true}
      />

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Group for Review'}
      </Button>
    </form>
  );
} 