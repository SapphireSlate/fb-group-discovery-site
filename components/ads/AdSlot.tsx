'use client';

import { useEffect, useState } from 'react';

interface AdRecord {
  id: string;
  slot: 'top_banner' | 'sidebar' | 'in_feed';
  creative_type: 'image' | 'html';
  creative_url?: string;
  html?: string;
  target_url: string;
}

interface AdSlotProps {
  slot: AdRecord['slot'];
  className?: string;
}

export default function AdSlot({ slot, className }: AdSlotProps) {
  const [ad, setAd] = useState<AdRecord | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/ads?slot=${slot}`);
        if (!res.ok) return;
        const json = await res.json();
        const ad = json?.data?.[0] || null;
        if (!cancelled) setAd(ad);
      } catch {
        // ignore
      }
    }
    load();
    return () => { cancelled = true; };
  }, [slot]);

  if (!ad) return null;

  const onClick = () => {
    try { fetch(`/api/ads/click/${ad.id}`, { method: 'POST' }); } catch {}
  };

  useEffect(() => {
    try { fetch(`/api/ads/impression/${ad.id}`, { method: 'POST' }); } catch {}
  }, [ad?.id]);

  return (
    <div className={className} aria-label="Advertisement">
      {ad.creative_type === 'image' && ad.creative_url ? (
        <a href={ad.target_url} target="_blank" rel="noopener noreferrer" onClick={onClick}>
          <img src={ad.creative_url} alt="Advertisement" className="w-full h-auto" />
        </a>
      ) : ad.html ? (
        <a href={ad.target_url} target="_blank" rel="noopener noreferrer" onClick={onClick}
           dangerouslySetInnerHTML={{ __html: ad.html }}
        />
      ) : null}
    </div>
  );
}


