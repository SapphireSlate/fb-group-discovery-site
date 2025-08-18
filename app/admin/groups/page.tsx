import { requireAdmin } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default async function AdminGroupsPage() {
  await requireAdmin();
  const supabase = await createServerClient();

  const { data: groups } = await supabase
    .from('groups')
    .select('id, name, status, submitted_at')
    .order('submitted_at', { ascending: false })
    .limit(50);

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Groups Review</h1>
        <Link href="/admin">
          <Button variant="outline">Back to Admin</Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>Review, approve, or reject submitted groups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {groups?.map((g) => (
              <div key={g.id} className="flex items-center justify-between border rounded p-3">
                <div>
                  <div className="font-medium">{g.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{g.status}</div>
                </div>
                <Link href={`/admin/review/${g.id}`}>
                  <Button size="sm" variant="outline">Review</Button>
                </Link>
              </div>
            )) || <div className="text-muted-foreground">No groups found</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


