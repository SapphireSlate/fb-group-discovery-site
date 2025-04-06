-- Create monetization tables

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON public.subscriptions(status);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions" 
  ON public.subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admin users can view all subscriptions" 
  ON public.subscriptions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Featured Listings table
CREATE TABLE IF NOT EXISTS public.featured_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  promotion_type TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  amount_paid NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS featured_listings_group_id_idx ON public.featured_listings(group_id);
CREATE INDEX IF NOT EXISTS featured_listings_status_idx ON public.featured_listings(status);
CREATE INDEX IF NOT EXISTS featured_listings_date_idx ON public.featured_listings(end_date);

ALTER TABLE public.featured_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Featured listings are viewable by everyone" 
  ON public.featured_listings FOR SELECT 
  USING (true);

-- Payment History table
CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  payment_method TEXT,
  status TEXT NOT NULL,
  type TEXT NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS payment_history_user_id_idx ON public.payment_history(user_id);
CREATE INDEX IF NOT EXISTS payment_history_type_idx ON public.payment_history(type);

ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment history" 
  ON public.payment_history FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admin users can view all payment history" 
  ON public.payment_history FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Update users table to add payment-related fields
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none';

-- Create view for subscription statistics
CREATE OR REPLACE VIEW subscription_stats AS
SELECT 
  plan_id,
  status,
  COUNT(*) as count
FROM
  public.subscriptions
GROUP BY
  plan_id, status;

-- Create function to get featured groups
CREATE OR REPLACE FUNCTION get_featured_groups()
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  url TEXT,
  category_id UUID,
  promotion_type TEXT,
  end_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id,
    g.name,
    g.description,
    g.url,
    g.category_id,
    f.promotion_type,
    f.end_date
  FROM 
    public.featured_listings f
    JOIN public.groups g ON f.group_id = g.id
  WHERE 
    f.status = 'active'
    AND f.start_date <= NOW()
    AND f.end_date >= NOW()
  ORDER BY 
    CASE 
      WHEN f.promotion_type = 'featured' THEN 1
      WHEN f.promotion_type = 'category_spotlight' THEN 2
      WHEN f.promotion_type = 'enhanced_listing' THEN 3
      ELSE 4
    END;
END;
$$ LANGUAGE plpgsql; 