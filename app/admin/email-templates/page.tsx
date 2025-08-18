import { requireAdmin } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

export default async function AdminEmailTemplatesPage() {
  await requireAdmin();
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Email Templates</h1>
      <Card>
        <CardHeader>
          <CardTitle>Templates</CardTitle>
          <CardDescription>Manage email templates for notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm">Template editor coming soon.</div>
        </CardContent>
      </Card>
    </div>
  );
}


