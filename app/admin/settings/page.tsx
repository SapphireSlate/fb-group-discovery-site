import { requireAdmin } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminSettingsPage() {
  await requireAdmin();
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>Manage admin-only configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm">Settings coming soon.</div>
        </CardContent>
      </Card>
    </div>
  );
}


