import { createServerClient } from '@/lib/supabase';

export default async function AdPreviewPage({ params }: { params: { id: string } }) {
  const supabase = await createServerClient();
  const { data: ad } = await supabase
    .from('ads')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (!ad) {
    return (
      <div className="container mx-auto py-12">
        <p className="text-muted-foreground">Ad not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl border rounded-lg p-4 space-y-3">
        <div className="text-sm text-muted-foreground">Preview • Slot: {ad.slot} • Type: {ad.creative_type} • Status: {ad.status}</div>
        <div className="border rounded p-3">
          {ad.creative_type === 'image' && ad.creative_url ? (
            <a href={ad.target_url} target="_blank" rel="noopener noreferrer">
              <img src={ad.creative_url} alt="Ad" className="max-w-full h-auto" />
            </a>
          ) : (
            <a href={ad.target_url} target="_blank" rel="noopener noreferrer" dangerouslySetInnerHTML={{ __html: ad.html || '' }} />
          )}
        </div>
        <div className="text-xs text-muted-foreground">This is a shareable preview link you can send to buyers.</div>
      </div>
    </div>
  );
}


