-- Create Users Table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR NOT NULL UNIQUE,
  display_name VARCHAR NOT NULL,
  avatar_url VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE,
  reputation INTEGER DEFAULT 0,
  auth_id UUID REFERENCES auth.users(id)
);

-- Enable RLS on Users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create Categories Table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR,
  group_count INTEGER DEFAULT 0
);

-- Enable RLS on Categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create Tags Table
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL UNIQUE,
  group_count INTEGER DEFAULT 0
);

-- Enable RLS on Tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Create Groups Table
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  url VARCHAR NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  size INTEGER,
  activity_level VARCHAR,
  screenshot_url VARCHAR,
  submitted_by UUID REFERENCES public.users(id),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_verified TIMESTAMP WITH TIME ZONE,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  is_private BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  status VARCHAR DEFAULT 'pending',
  search_vector TSVECTOR
);

-- Enable RLS on Groups
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Create search index on Groups
CREATE INDEX group_search_idx ON public.groups USING GIN (search_vector);

-- Create Groups_Tags Junction Table
CREATE TABLE public.groups_tags (
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, tag_id)
);

-- Enable RLS on Groups_Tags
ALTER TABLE public.groups_tags ENABLE ROW LEVEL SECURITY;

-- Create Reviews Table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE,
  helpful_votes INTEGER DEFAULT 0
);

-- Enable RLS on Reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create Votes Table
CREATE TABLE public.votes (
  user_id UUID REFERENCES public.users(id),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  vote_type VARCHAR NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (user_id, group_id)
);

-- Enable RLS on Votes
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Create function to update group ratings
CREATE OR REPLACE FUNCTION update_group_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.groups
  SET average_rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM public.reviews
    WHERE group_id = NEW.group_id
  )
  WHERE id = NEW.group_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for group ratings
CREATE TRIGGER on_review_added
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW
EXECUTE PROCEDURE update_group_rating();

-- Create function to update vote counts
CREATE OR REPLACE FUNCTION update_group_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.vote_type = 'upvote' THEN
    UPDATE public.groups
    SET upvotes = upvotes + 1
    WHERE id = NEW.group_id;
  ELSIF NEW.vote_type = 'downvote' THEN
    UPDATE public.groups
    SET downvotes = downvotes + 1
    WHERE id = NEW.group_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vote counts
CREATE TRIGGER on_vote_added
AFTER INSERT ON public.votes
FOR EACH ROW
EXECUTE PROCEDURE update_group_votes();

-- Create function to update category counts
CREATE OR REPLACE FUNCTION update_category_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.categories
  SET group_count = (
    SELECT COUNT(*)
    FROM public.groups
    WHERE category_id = NEW.category_id
    AND status = 'active'
  )
  WHERE id = NEW.category_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for category counts
CREATE TRIGGER on_group_category_change
AFTER INSERT OR UPDATE OF category_id, status ON public.groups
FOR EACH ROW
EXECUTE PROCEDURE update_category_count();

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_group_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = to_tsvector('english', 
    COALESCE(NEW.name, '') || ' ' || 
    COALESCE(NEW.description, '') || ' ' || 
    COALESCE((SELECT string_agg(t.name, ' ') 
              FROM public.tags t 
              JOIN public.groups_tags gt ON t.id = gt.tag_id 
              WHERE gt.group_id = NEW.id), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for search vector
CREATE TRIGGER group_search_vector_update
BEFORE INSERT OR UPDATE ON public.groups
FOR EACH ROW
EXECUTE PROCEDURE update_group_search_vector();

-- Create RLS Policies

-- Users policies
CREATE POLICY "Users are viewable by everyone"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own record"
  ON users FOR UPDATE
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can insert their own record"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = auth_id);

-- Categories policies
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

-- Tags policies
CREATE POLICY "Tags are viewable by everyone"
  ON tags FOR SELECT
  USING (true);

-- Groups policies
CREATE POLICY "Active groups are viewable by everyone"
  ON groups FOR SELECT
  USING (status = 'active');

CREATE POLICY "Authenticated users can insert groups"
  ON groups FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.users));

CREATE POLICY "Users can update their own groups"
  ON groups FOR UPDATE
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = submitted_by));

-- Groups_Tags policies
CREATE POLICY "Group tags are viewable by everyone"
  ON groups_tags FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add tags to their groups"
  ON groups_tags FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT u.auth_id FROM public.users u
    JOIN public.groups g ON u.id = g.submitted_by
    WHERE g.id = group_id
  ));

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.users));

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));

-- Votes policies
CREATE POLICY "Authenticated users can vote"
  ON votes FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.users));

CREATE POLICY "Users can update their own votes"
  ON votes FOR UPDATE
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));

-- Seed initial data

-- Insert categories
INSERT INTO public.categories (name, description, icon) VALUES
('Technology', 'Groups focused on technology, programming, and digital innovations.', 'laptop'),
('Business', 'Groups for entrepreneurs, business owners, and professionals.', 'briefcase'),
('Health & Wellness', 'Groups related to fitness, mental health, and overall wellbeing.', 'heart'),
('Hobbies & Interests', 'Groups for various hobbies, crafts, and special interests.', 'palette'),
('Education', 'Groups for learning, academic discussions, and educational resources.', 'book'),
('Travel', 'Groups focused on travel tips, destinations, and experiences.', 'map'),
('Entertainment', 'Groups related to movies, music, games, and other entertainment.', 'film'),
('Family & Relationships', 'Groups for parenting, family issues, and relationship advice.', 'users');

-- Insert common tags
INSERT INTO public.tags (name) VALUES
('Marketing'), ('Programming'), ('Startups'), ('Remote Work'), ('Fitness'),
('Nutrition'), ('Mental Health'), ('Art'), ('Photography'), ('Reading'),
('Writing'), ('Cooking'), ('Music'), ('Movies'), ('Gaming'),
('Language Learning'), ('Investing'), ('Personal Finance'), ('Career Advice'), ('Networking'); 