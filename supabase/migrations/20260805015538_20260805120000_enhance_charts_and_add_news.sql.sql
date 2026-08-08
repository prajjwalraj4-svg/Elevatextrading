/*
# Enhance Charts with Timeframe/Bias/Time + Add News Section

1. Overview
This migration enhances the `charts` table with new fields requested for the
admin upload form: `timeframe`, `bias` (Buy/Sell/Neutral), and `chart_time`.
It also creates a `news` table for admin-published market news, and a
`premium_analysis` table for premium analysis content.

2. Modified Tables
- `charts`: adds `timeframe` (text), `bias` (text CHECK buy/sell/neutral),
  `chart_time` (time), `updated_at` (timestamptz with trigger).

3. New Tables
- `news`: admin-published market news (title, content, category, image_url,
  status, published_at). Public read for published; admin/analyst write.
- `premium_analysis`: premium analysis posts (title, content, market_id,
  is_premium, status, published_at). Public read published; admin/analyst write.

4. Security
- RLS enabled on `news` and `premium_analysis`.
- Public read for published rows; admin/analyst write.
- `charts` updated_at trigger added.
*/

-- ============================================================
-- CHARTS: add timeframe, bias, chart_time, updated_at
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'charts' AND column_name = 'timeframe') THEN
    ALTER TABLE charts ADD COLUMN timeframe text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'charts' AND column_name = 'bias') THEN
    ALTER TABLE charts ADD COLUMN bias text DEFAULT 'neutral' CHECK (bias IN ('buy', 'sell', 'neutral'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'charts' AND column_name = 'chart_time') THEN
    ALTER TABLE charts ADD COLUMN chart_time time;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'charts' AND column_name = 'updated_at') THEN
    ALTER TABLE charts ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
  END IF;
END $$;

DROP TRIGGER IF EXISTS set_updated_at_charts ON charts;
CREATE TRIGGER set_updated_at_charts BEFORE UPDATE ON charts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- NEWS TABLE
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

DROP TRIGGER IF EXISTS set_updated_at_news ON news;
CREATE TRIGGER set_updated_at_news BEFORE UPDATE ON news
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- PREMIUM ANALYSIS TABLE
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

DROP TRIGGER IF EXISTS set_updated_at_premium ON premium_analysis;
CREATE TRIGGER set_updated_at_premium BEFORE UPDATE ON premium_analysis
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
