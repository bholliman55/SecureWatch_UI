-- Fix: "asset_id does not exist" and ensure Start Scan + data load work
-- Run this in Supabase SQL Editor. Safe to run multiple times.

-- 1. Ensure assets table has id column (in case it was created without it)
ALTER TABLE assets
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();
UPDATE assets SET id = gen_random_uuid() WHERE id IS NULL;

-- 2. Add asset_id column without FK (avoids "assets.id does not exist" if assets schema differs)
ALTER TABLE vulnerabilities
  ADD COLUMN IF NOT EXISTS asset_id uuid;

ALTER TABLE scans
  ADD COLUMN IF NOT EXISTS asset_id uuid;

-- Optional: add nullable asset_id to other tables if an RLS policy references it
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'monitoring_checks') THEN
    ALTER TABLE monitoring_checks ADD COLUMN IF NOT EXISTS asset_id uuid;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'compliance_audits') THEN
    ALTER TABLE compliance_audits ADD COLUMN IF NOT EXISTS asset_id uuid;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'training_modules') THEN
    ALTER TABLE training_modules ADD COLUMN IF NOT EXISTS asset_id uuid;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'incidents') THEN
    ALTER TABLE incidents ADD COLUMN IF NOT EXISTS asset_id uuid;
  END IF;
END $$;

-- 3. Ensure vulnerabilities.cve_id is text (some migrations had integer)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'vulnerabilities' AND column_name = 'cve_id' AND data_type = 'integer') THEN
    ALTER TABLE vulnerabilities ALTER COLUMN cve_id TYPE text USING cve_id::text;
  END IF;
END $$;

-- 4. Drop and recreate anon policies so no stale policy references wrong columns
DROP POLICY IF EXISTS "Anonymous users can view all scans" ON scans;
CREATE POLICY "Anonymous users can view all scans"
  ON scans FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Anonymous users can insert scans" ON scans;
CREATE POLICY "Anonymous users can insert scans"
  ON scans FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Anonymous users can view all vulnerabilities" ON vulnerabilities;
CREATE POLICY "Anonymous users can view all vulnerabilities"
  ON vulnerabilities FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Anonymous users can view all assets" ON assets;
CREATE POLICY "Anonymous users can view all assets"
  ON assets FOR SELECT TO anon USING (true);
