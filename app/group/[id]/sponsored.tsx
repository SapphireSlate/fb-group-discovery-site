'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SponsoredListing {
  id: string;
  group_id: string;
  groups: {
    id: string;
    name: string;
    description: string | null;
  } | null;
}

export default function SponsoredGroup({ groupId }: { groupId: string }) {
  const [listing, setListing] = useState<SponsoredListing | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const nowIso = new Date().toISOString();
        const res = await fetch(`/api/featured-listings`);
        if (!res.ok) return;
        const json = await res.json();
        const items = json?.data || [];
        // Fallback: just take first
        if (!cancelled && items.length > 0) setListing(items[0]);
      } catch {
        // ignore
      }
    }
    load();
    return () => { cancelled = true; };
  }, [groupId]);

  if (!listing || !listing.groups) return null;

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-base">Sponsored Group</CardTitle>
        <Badge variant="secondary">Sponsored</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Link href={`/group/${listing.groups.id}`} className="hover:underline font-medium">
            {listing.groups.name}
          </Link>
          {listing.groups.description ? (
            <p className="text-sm text-muted-foreground line-clamp-3">{listing.groups.description}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}


