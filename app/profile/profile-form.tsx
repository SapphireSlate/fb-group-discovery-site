'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database } from '@/lib/database.types';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface ProfileFormProps {
  profile: UserProfile;
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);
    
    try {
      const supabase = getSupabaseBrowser();
      
      // Upload avatar if changed
      let avatarUrl = profile.avatar_url;
      if (avatar) {
        const fileName = `${Math.random().toString(36).substring(2)}.${avatar.name.split('.').pop()}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(`public/${fileName}`, avatar);
        
        if (uploadError) {
          throw uploadError;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(`public/${fileName}`);
        
        avatarUrl = publicUrl;
      }
      
      // Update profile in the database
      const { error: updateError } = await supabase
        .from('users')
        .update({
          display_name: displayName,
          avatar_url: avatarUrl,
        })
        .eq('id', profile.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Update auth metadata
      await supabase.auth.updateUser({
        data: { display_name: displayName }
      });
      
      setSuccess(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating your profile');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-24 w-24">
          {avatarPreview ? (
            <AvatarImage src={avatarPreview} alt={displayName} />
          ) : (
            <AvatarFallback>{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
          )}
        </Avatar>
        <div>
          <Label htmlFor="avatar" className="block mb-2">Profile Picture</Label>
          <Input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={profile.email}
          disabled
          className="bg-gray-100"
        />
        <p className="text-sm text-gray-500">Email cannot be changed</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us a bit about yourself"
          rows={4}
        />
      </div>
      
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-700">
            Profile updated successfully!
          </AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
} 