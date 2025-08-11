'use client';

import { useEffect, useState } from 'react';

export default function AdPreview({ slot }: { slot: 'top_banner'|'sidebar'|'in_feed' }) {
  const [ads, setAds] = useState<any[]>([]);
  useEffect(()=>{
    let cancelled=false;
    (async()=>{
      const res=await fetch(`/api/ads?slot=${slot}`);
      const j=await res.json();
      if(!cancelled) setAds(j?.data||[]);
    })();
    return ()=>{cancelled=true};
  },[slot]);

  if(!ads.length) return <p className="text-sm text-muted-foreground">No ads for {slot} right now.</p>;
  return (
    <div className="space-y-2">
      {ads.map((ad)=> (
        <div key={ad.id} className="border rounded p-2">
          <div className="text-xs text-muted-foreground">{ad.slot} • {ad.creative_type} • {ad.status}</div>
          <div className="mt-2">
            {ad.creative_type==='image' && ad.creative_url ? (
              <img src={ad.creative_url} alt="preview" className="max-w-full h-auto" />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: ad.html || '' }} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}


