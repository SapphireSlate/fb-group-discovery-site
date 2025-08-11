import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Bell, Mail, Shield, User, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default async function SettingsPage() {
  // Check if user is authenticated
  const user = await requireAuth();
  
  if (!user) {
    redirect('/login?callbackUrl=/settings');
  }
  
  // Get user record to check if admin
  const supabase = await createServerClient();
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .single();
    
  const isAdmin = profile?.is_admin || false;
  
  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <SettingsCard
          title="Profile Settings"
          description="Update your personal information and profile details"
          icon={<User className="h-5 w-5" />}
          href="/settings/profile"
        />
        
        <SettingsCard
          title="Email Preferences"
          description="Control which email notifications you receive"
          icon={<Mail className="h-5 w-5" />}
          href="/settings/email-preferences"
        />
        
        <SettingsCard
          title="Notification Settings"
          description="Manage your in-app notification preferences"
          icon={<Bell className="h-5 w-5" />}
          href="/settings/notifications"
        />
        
        <SettingsCard
          title="Account Security"
          description="Update your password and security settings"
          icon={<Shield className="h-5 w-5" />}
          href="/settings/security"
        />
        
        {isAdmin && (
          <SettingsCard
            title="Admin Dashboard"
            description="Access admin tools and settings"
            icon={<Wrench className="h-5 w-5" />}
            href="/admin"
            className="md:col-span-2"
          />
        )}
      </div>
    </div>
  );
}

function SettingsCard({ 
  title, 
  description, 
  icon, 
  href,
  className = ''
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  href: string;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            {icon}
          </div>
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button asChild>
          <Link href={href}>
            Manage
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
} 