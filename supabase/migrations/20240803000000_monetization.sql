-- Create subscription plans table
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10, 2) NOT NULL,
  price_yearly DECIMAL(10, 2),
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies to plans table
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Everyone can view active plans
DROP POLICY IF EXISTS "Anyone can view active plans" ON public.plans;
CREATE POLICY "Anyone can view active plans" ON public.plans
  FOR SELECT USING (is_active = true);

-- Only admins can manage plans
DROP POLICY IF EXISTS "Admins can manage plans" ON public.plans;
CREATE POLICY "Admins can manage plans" ON public.plans
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT REFERENCES public.plans(id) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  payment_method TEXT,
  payment_processor TEXT,
  payment_processor_subscription_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies to subscriptions table
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid());

-- Admins can view all subscriptions
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- Create payment history table
CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('succeeded', 'failed', 'pending', 'refunded')),
  payment_method TEXT,
  payment_processor TEXT,
  payment_processor_payment_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies to payment_history table
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own payment history
DROP POLICY IF EXISTS "Users can view their own payment history" ON public.payment_history;
CREATE POLICY "Users can view their own payment history" ON public.payment_history
  FOR SELECT USING (user_id = auth.uid());

-- Admins can view all payment history
DROP POLICY IF EXISTS "Admins can view all payment history" ON public.payment_history;
CREATE POLICY "Admins can view all payment history" ON public.payment_history
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- Create group promotions table
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  package TEXT NOT NULL CHECK (package IN ('basic', 'standard', 'premium')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'expired', 'pending')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  custom_message TEXT,
  target_audience TEXT,
  views_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies to promotions table
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Users can view their own promotions
DROP POLICY IF EXISTS "Users can view their own promotions" ON public.promotions;
CREATE POLICY "Users can view their own promotions" ON public.promotions
  FOR SELECT USING (user_id = auth.uid());

-- Admins can view and manage all promotions
DROP POLICY IF EXISTS "Admins can view all promotions" ON public.promotions;
CREATE POLICY "Admins can view all promotions" ON public.promotions
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "Admins can update all promotions" ON public.promotions;
CREATE POLICY "Admins can update all promotions" ON public.promotions
  FOR UPDATE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- Anyone can view basic promotion info
DROP POLICY IF EXISTS "Anyone can view active promotion info" ON public.promotions;
CREATE POLICY "Anyone can view active promotion info" ON public.promotions
  FOR SELECT USING (status = 'active');

-- Add columns to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS has_subscription BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS plan_id TEXT REFERENCES public.plans(id);

-- Add columns to groups table
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN DEFAULT false;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS promotion_type TEXT;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS promotion_ends_at TIMESTAMP WITH TIME ZONE;

-- Create function to update group promotion status when promotion expires
CREATE OR REPLACE FUNCTION public.update_expired_promotions()
RETURNS TRIGGER AS $$
BEGIN
  -- Update promotion status to expired
  UPDATE public.promotions
  SET status = 'expired', updated_at = now()
  WHERE id = OLD.id AND status = 'active' AND end_date <= now();
  
  -- Update group promotion status
  UPDATE public.groups
  SET 
    is_promoted = false,
    promotion_type = null,
    promotion_ends_at = null,
    updated_at = now()
  WHERE id = OLD.group_id AND is_promoted = true AND (
    SELECT count(*) FROM public.promotions 
    WHERE group_id = OLD.group_id AND status = 'active' AND end_date > now()
  ) = 0;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update expired promotions
CREATE TRIGGER update_expired_promotion_trigger
AFTER UPDATE ON public.promotions
FOR EACH ROW
EXECUTE FUNCTION public.update_expired_promotions();

-- Insert initial plans
INSERT INTO public.plans (id, name, description, price_monthly, price_yearly, features, is_active)
VALUES 
  ('basic', 'Basic', 'For casual browsers', 0, 0, 
   '["Standard group discovery", "Basic search filters", "Vote and review groups", "Personal profile", "Submit new groups"]'::jsonb,
   true),
  ('premium', 'Premium', 'For avid community members', 5.99, 59.99, 
   '["Advanced search filters", "Ad-free experience", "Early access to new groups", "Premium user badge", "Personalized recommendations", "Save favorite groups"]'::jsonb,
   true),
  ('professional', 'Professional', 'For business networkers', 9.99, 99.99, 
   '["All Premium features", "Personal analytics dashboard", "API access", "Priority customer support", "Dedicated account manager", "Advanced group analytics", "Bulk CSV export"]'::jsonb,
   true);

-- Create view for active subscriptions
CREATE OR REPLACE VIEW public.active_subscriptions AS
SELECT 
  s.id,
  s.user_id,
  u.email,
  u.display_name AS full_name,
  s.plan_id,
  p.name as plan_name,
  p.price_monthly,
  s.current_period_end,
  s.created_at as subscription_start_date,
  s.updated_at
FROM public.subscriptions s
JOIN public.users u ON s.user_id = u.id
JOIN public.plans p ON s.plan_id = p.id
WHERE s.status = 'active';

-- Grant permissions
GRANT SELECT ON TABLE public.plans TO authenticated, anon;
GRANT SELECT ON TABLE public.active_subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.subscriptions TO authenticated;
GRANT SELECT ON TABLE public.payment_history TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.promotions TO authenticated;

-- Create function to check if user has an active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  has_sub BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = user_uuid
    AND status = 'active'
    AND current_period_end > now()
  ) INTO has_sub;
  
  RETURN has_sub;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user's current plan
CREATE OR REPLACE FUNCTION public.get_user_plan(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  user_plan_id TEXT;
BEGIN
  SELECT plan_id INTO user_plan_id
  FROM public.subscriptions
  WHERE user_id = user_uuid
  AND status = 'active'
  AND current_period_end > now()
  ORDER BY current_period_end DESC
  LIMIT 1;
  
  RETURN COALESCE(user_plan_id, 'basic');
END;
$$ LANGUAGE plpgsql; 