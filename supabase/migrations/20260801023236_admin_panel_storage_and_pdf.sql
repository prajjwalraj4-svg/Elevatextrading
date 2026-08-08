/*
# ElevateX Admin Panel — Storage Bucket, PDF Reports Table, and Market Add Capability

1. Overview
This migration sets up Supabase Storage for chart image, PDF report, and video
file uploads. It also creates a `pdf_reports` table for storing PDF report
metadata, and adds an `is_pinned` column to charts for pinning important charts.

2. Storage
- Creates a public bucket `uploads` for chart images, PDFs, and videos.
- Storage policies: anyone can read (public bucket); only authenticated
  admin/analyst users can upload, update, or delete files.

3. New Tables
- `pdf_reports`: stores PDF report metadata (title, description, file_url,
  report_type, market_id, published_at). Public read; admin/analyst write.

4. Modified Tables
- `charts`: adds `is_pinned boolean DEFAULT false` column.

5. Security
- RLS enabled on `pdf_reports`.
- Storage policies enforce admin/analyst-only writes via a helper check.
*/

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read, admin/analyst write
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
-- CHARTS: add is_pinned column
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'charts' AND column_name = 'is_pinned') THEN
    ALTER TABLE charts ADD COLUMN is_pinned boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- ============================================================
-- PDF REPORTS TABLE
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

-- updated_at trigger for pdf_reports
DROP TRIGGER IF EXISTS set_updated_at_pdf_reports ON pdf_reports;
CREATE TRIGGER set_updated_at_pdf_reports BEFORE UPDATE ON pdf_reports FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
