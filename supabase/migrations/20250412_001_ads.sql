-- Ads (display inventory) schema

CREATE TABLE IF NOT EXISTS public.ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES public.users(id),
  slot TEXT NOT NULL CHECK (slot IN ('top_banner', 'sidebar', 'in_feed')),
  creative_type TEXT NOT NULL CHECK (creative_type IN ('image', 'html')),
  creative_url TEXT,
  html TEXT,
  target_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paused', 'ended')),
  daily_budget NUMERIC(10,2) DEFAULT 0,
  spend NUMERIC(10,2) DEFAULT 0,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ads_slot_idx ON public.ads(slot);
CREATE INDEX IF NOT EXISTS ads_status_idx ON public.ads(status);

ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Anyone can view ads (selection happens server side)
CREATE POLICY "Ads are viewable by everyone"
  ON public.ads FOR SELECT
  USING (true);

-- Owners can insert their own ads
CREATE POLICY "Users can insert own ads"
  ON public.ads FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = owner_user_id));

-- Owners can update their own ads when not approved
CREATE POLICY "Users can update own pending ads"
  ON public.ads FOR UPDATE
  USING (
    auth.uid() IN (SELECT auth_id FROM public.users WHERE id = owner_user_id)
    AND status IN ('pending','paused')
  );

-- Admin can manage all ads
CREATE POLICY "Admins can manage ads"
  ON public.ads FOR ALL
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE is_admin = true));

-- Impression and click logs
CREATE TABLE IF NOT EXISTS public.ad_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ad_impressions_ad_id_idx ON public.ad_impressions(ad_id);

CREATE TABLE IF NOT EXISTS public.ad_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ad_clicks_ad_id_idx ON public.ad_clicks(ad_id);

ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Impressions are insertable by anyone"
  ON public.ad_impressions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Clicks are insertable by anyone"
  ON public.ad_clicks FOR INSERT
  WITH CHECK (true);


