-- Run this in Supabase SQL Editor if "Start Scan" fails with a row-level security error.
-- This allows anonymous users to create scans (required for the New Scan modal without auth).

DROP POLICY IF EXISTS "Anonymous users can insert scans" ON scans;
CREATE POLICY "Anonymous users can insert scans"
  ON scans FOR INSERT
  TO anon
  WITH CHECK (true);
