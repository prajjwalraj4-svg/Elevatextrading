-- ============================================================
-- ElevateX — Complete Database Schema (Consolidated)
-- Run this in the Supabase SQL Editor for project pkxvsurscsqkfjzhebnq
-- ============================================================

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  avatar_url text DEFAULT '',
  bio text DEFAULT '',
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'analyst', 'user')),
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'vip')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================
-- MARKETS
-- ============================================================
CREATE TABLE IF NOT EXISTS markets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('crypto', 'forex', 'indices', 'commodities', 'metals')),
  logo_url text DEFAULT '',
  live_price numeric DEFAULT 0,
  price_change numeric DEFAULT 0,
  price_change_pct numeric DEFAULT 0,
  daily_trend text DEFAULT 'neutral',
  weekly_trend text DEFAULT 'neutral',
  monthly_trend text DEFAULT 'neutral',
  market_bias text DEFAULT 'neutral',
  institutional_bias text DEFAULT 'neutral',
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE markets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_markets" ON markets;
CREATE POLICY "public_read_markets" ON markets FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_markets" ON markets;
CREATE POLICY "admin_insert_markets" ON markets FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'analyst')));

DROP POLICY IF EXISTS "admin_update_markets" ON markets;
CREATE POLICY "admin_update_markets" ON markets FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'analyst'))) WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'analyst')));

DROP POLICY IF EXISTS "admin_delete_markets" ON markets;
CREATE POLICY "admin_delete_markets" ON markets FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'analyst')));

-- ============================================================
-- ANALYSIS
-- ============================================================
CREATE TABLE IF NOT EXISTS analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid REFERENCES markets(id) ON DELETE CASCADE,
  title text NOT NULL,
  analysis_type text NOT NULL DEFAULT 'daily' CHECK (analysis_type IN ('daily', 'weekly', 'monthly')),
  content text DEFAULT '',
  institutional_view text DEFAULT '',
  trade_setup text DEFAULT '',
  risk_warning text DEFAULT '',
  targets text DEFAULT '',
  support_levels text DEFAULT '',
  resistance_levels text DEFAULT '',
  support_zone text DEFAULT '',
  resistance_zone text DEFAULT '',
  supply_zone text DEFAULT '',
  demand_zone text DEFAULT '',
  liquidity_zone text DEFAULT '',
  entry_zone text DEFAULT '',
  stop_loss text DEFAULT '',
  take_profit_1 text DEFAULT '',
  take_profit_2 text DEFAULT '',
  take_profit_3 text DEFAULT '',
  risk_reward_ratio text DEFAULT '',
  market_structure text DEFAULT '',
  smc_analysis text DEFAULT '',
  analyst_name text DEFAULT '',
  confidence_score int DEFAULT 0,
  market_sentiment text DEFAULT 'neutral',
  buy_probability int DEFAULT 50,
  sell_probability int DEFAULT 50,
  expected_direction text DEFAULT 'neutral',
  estimated_volatility text DEFAULT 'medium',
  is_pinned boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'scheduled')),
  published_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE analysis ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_analysis_market ON analysis(market_id);
CREATE INDEX IF NOT EXISTS idx_analysis_type ON analysis(analysis_type);
CREATE INDEX IF NOT EXISTS idx_analysis_published ON analysis(published_at DESC);

DROP POLICY IF EXISTS "public_read_analysis" ON analysis;
CREATE POLICY "public_read_analysis" ON analysis FOR SELECT
  TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "admin_insert_analysis" ON analysis;
CREATE POLICY "admin_insert_analysis" ON analysis FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'analyst')));

DROP POLICY IF EXISTS "admin_update_analysis" ON analysis;
CREATE POLICY "admin_update_analysis" ON analysis FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'analyst'))) WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'analyst')));

DROP POLICY IF EXISTS "admin_delete_analysis" ON analysis;
CREATE POLICY "admin_delete_analysis" ON analysis FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'analyst')));

-- ============================================================
-- CHARTS
-- ============================================================
CREATE TABLE IF NOT EXISTS charts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid REFERENCES analysis(id) ON DELETE CASCADE,
  market_id uuid REFERENCES markets(id) ON DELETE SET NULL,
  image_url text NOT NULL,
  title text DEFAULT '',
  description text DEFAULT '',
  category text DEFAULT 'chart' CHECK (category IN ('chart', 'tradingview', 'before_after', 'entry', 'exit', 'video')),
  video_url text DEFAULT '',
  chart_date date DEFAULT CURRENT_DATE,
  is_pinned boolean NOT NULL DEFAULT false,
  timeframe text DEFAULT '',
  bias text DEFAULT 'neutral' CHECK (bias IN ('buy', 'sell', 'neutral')),
  chart_time time,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE charts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_charts_analysis ON charts(analysis_id);
CREATE INDEX IF NOT EXISTS idx_charts_market ON charts(market_id);

DROP POLICY IF EXISTS "public_read_charts" ON charts;
CREATE POLICY "public_read_charts" ON charts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_charts" ON charts;
CREATE POLICY "admin_insert_charts" ON charts FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'analyst')));

DROP POLICY IF EXISTS "admin_update_charts" ON charts;
CREATE POLICY "admin_update_charts" ON charts FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'analyst'))) WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'analyst')));

DROP POLICY IF EXISTS "admin_delete_charts" ON charts;
CREATE POLICY "admin_delete_charts" ON charts FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'analyst')));

-- ============================================================
-- BLOG POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'education' CHECK (category IN ('education', 'smc', 'risk', 'psychology', 'news', 'beginner', 'advanced')),
  excerpt text DEFAULT '',
  content text DEFAULT '',
  cover_image text DEFAULT '',
  author text DEFAULT '',
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  views int NOT NULL DEFAULT 0,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(published_at DESC);

DROP POLICY IF EXISTS "public_read_blog" ON blog_posts;
CREATE POLICY "public_read_blog" ON blog_posts FOR SELECT
  TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "admin_insert_blog" ON blog_posts;
CREATE POLICY "admin_insert_blog" ON blog_posts FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'analyst')));

DROP POLICY IF EXISTS "admin_update_blog" ON blog_posts;
CREATE POLICY "admin_update_blog" ON blog_posts FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'analyst'))) WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'analyst')));

DROP POLICY IF EXISTS "admin_delete_blog" ON blog_posts;
CREATE POLICY "admin_delete_blog" ON blog_posts FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'analyst')));

-- ============================================================
-- JOURNAL TRADES (user-owned)
-- ============================================================
CREATE TABLE IF NOT EXISTS journal_trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  pair text NOT NULL,
  direction text NOT NULL DEFAULT 'long' CHECK (direction IN ('long', 'short')),
  entry_price numeric DEFAULT 0,
  exit_price numeric DEFAULT 0,
  stop_loss numeric DEFAULT 0,
  take_profit numeric DEFAULT 0,
  screenshot_url text DEFAULT '',
  notes text DEFAULT '',
  result text DEFAULT 'open' CHECK (result IN ('open', 'win', 'loss', 'breakeven')),
  profit numeric DEFAULT 0,
  risk_reward text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE journal_trades ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_journal_user ON journal_trades(user_id);

DROP POLICY IF EXISTS "select_own_journal" ON journal_trades;
CREATE POLICY "select_own_journal" ON journal_trades FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_journal" ON journal_trades;
CREATE POLICY "insert_own_journal" ON journal_trades FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_journal" ON journal_trades;
CREATE POLICY "update_own_journal" ON journal_trades FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_journal" ON journal_trades;
CREATE POLICY "delete_own_journal" ON journal_trades FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- NOTIFICATIONS (user-owned)
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text DEFAULT '',
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'analysis', 'alert', 'membership', 'system')),
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- SOCIAL LINKS (admin-managed, public read)
-- ============================================================
CREATE TABLE IF NOT EXISTS social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  url text NOT NULL,
  label text DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_social" ON social_links;
CREATE POLICY "public_read_social" ON social_links FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_social" ON social_links;
CREATE POLICY "admin_insert_social" ON social_links FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "admin_update_social" ON social_links;
CREATE POLICY "admin_update_social" ON social_links FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "admin_delete_social" ON social_links;
CREATE POLICY "admin_delete_social" ON social_links FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- SUPPORT TICKETS
-- ============================================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_support_tickets" ON support_tickets;
CREATE POLICY "insert_support_tickets" ON support_tickets FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "select_own_support_tickets" ON support_tickets;
CREATE POLICY "select_own_support_tickets" ON support_tickets FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- PDF REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS pdf_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid REFERENCES markets(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text DEFAULT '',
  file_url text NOT NULL,
  file_name text DEFAULT '',
  report_type text NOT NULL DEFAULT 'weekly' CHECK (report_type IN ('daily', 'weekly', 'monthly', 'special')),
  published_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE pdf_reports ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_pdf_market ON pdf_reports(market_id);
CREATE INDEX IF NOT EXISTS idx_pdf_published ON pdf_reports(published_at DESC);

DROP POLICY IF EXISTS "public_read_pdf_reports" ON pdf_reports;
CREATE POLICY "public_read_pdf_reports" ON pdf_reports FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_pdf_reports" ON pdf_reports;
CREATE POLICY "admin_insert_pdf_reports" ON pdf_reports FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'analyst')));

DROP POLICY IF EXISTS "admin_update_pdf_reports" ON pdf_reports;
CREATE POLICY "admin_update_pdf_reports" ON pdf_reports FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'analyst'))) WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'analyst')));

DROP POLICY IF EXISTS "admin_delete_pdf_reports" ON pdf_reports;
CREATE POLICY "admin_delete_pdf_reports" ON pdf_reports FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'analyst')));

-- ============================================================
-- NEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text DEFAULT '',
  excerpt text DEFAULT '',
  category text NOT NULL DEFAULT 'market' CHECK (category IN ('market', 'crypto', 'forex', 'indices', 'commodities', 'metals', 'breaking', 'education')),
  image_url text DEFAULT '',
  author text DEFAULT '',
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  published_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_news_published ON news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);

DROP POLICY IF EXISTS "public_read_news" ON news;
CREATE POLICY "public_read_news" ON news FOR SELECT
  TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "admin_insert_news" ON news;
CREATE POLICY "admin_insert_news" ON news FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'analyst')));

DROP POLICY IF EXISTS "admin_update_news" ON news;
CREATE POLICY "admin_update_news" ON news FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'analyst')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'analyst')));

DROP POLICY IF EXISTS "admin_delete_news" ON news;
CREATE POLICY "admin_delete_news" ON news FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'analyst')));

-- ============================================================
-- PREMIUM ANALYSIS
-- ============================================================
CREATE TABLE IF NOT EXISTS premium_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid REFERENCES markets(id) ON DELETE SET NULL,
  title text NOT NULL,
  content text DEFAULT '',
  excerpt text DEFAULT '',
  analysis_type text NOT NULL DEFAULT 'premium' CHECK (analysis_type IN ('premium', 'institutional', 'smc', 'weekly', 'monthly')),
  is_premium boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  published_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE premium_analysis ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_premium_published ON premium_analysis(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_premium_market ON premium_analysis(market_id);

DROP POLICY IF EXISTS "public_read_premium" ON premium_analysis;
CREATE POLICY "public_read_premium" ON premium_analysis FOR SELECT
  TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "admin_insert_premium" ON premium_analysis;
CREATE POLICY "admin_insert_premium" ON premium_analysis FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'analyst')));

DROP POLICY IF EXISTS "admin_update_premium" ON premium_analysis;
CREATE POLICY "admin_update_premium" ON premium_analysis FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'analyst')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'analyst')));

DROP POLICY IF EXISTS "admin_delete_premium" ON premium_analysis;
CREATE POLICY "admin_delete_premium" ON premium_analysis FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'analyst')));

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read uploads" ON storage.objects;
CREATE POLICY "Public read uploads" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'uploads');

DROP POLICY IF EXISTS "Admin upload uploads" ON storage.objects;
CREATE POLICY "Admin upload uploads" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'uploads' AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'analyst')
    )
  );

DROP POLICY IF EXISTS "Admin update uploads" ON storage.objects;
CREATE POLICY "Admin update uploads" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'uploads' AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'analyst')
    )
  ) WITH CHECK (
    bucket_id = 'uploads' AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'analyst')
    )
  );

DROP POLICY IF EXISTS "Admin delete uploads" ON storage.objects;
CREATE POLICY "Admin delete uploads" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'uploads' AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'analyst')
    )
  );

-- ============================================================
-- TRIGGER FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
DROP TRIGGER IF EXISTS set_updated_at_profiles ON profiles;
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_markets ON markets;
CREATE TRIGGER set_updated_at_markets BEFORE UPDATE ON markets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_analysis ON analysis;
CREATE TRIGGER set_updated_at_analysis BEFORE UPDATE ON analysis FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_blog ON blog_posts;
CREATE TRIGGER set_updated_at_blog BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_journal ON journal_trades;
CREATE TRIGGER set_updated_at_journal BEFORE UPDATE ON journal_trades FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_charts ON charts;
CREATE TRIGGER set_updated_at_charts BEFORE UPDATE ON charts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_news ON news;
CREATE TRIGGER set_updated_at_news BEFORE UPDATE ON news FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_premium ON premium_analysis;
CREATE TRIGGER set_updated_at_premium BEFORE UPDATE ON premium_analysis FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_pdf_reports ON pdf_reports;
CREATE TRIGGER set_updated_at_pdf_reports BEFORE UPDATE ON pdf_reports FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
