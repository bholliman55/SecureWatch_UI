-- SecureWatch: Ensure all tables have the columns the app expects.
-- Run this in Supabase SQL Editor. Safe to run multiple times.
-- Fixes "column X does not exist" by adding any missing columns.
-- Tables must exist first (run the create_* migrations if needed).

-- ============ SCANS ============
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'scans') THEN
ALTER TABLE scans ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();
ALTER TABLE scans ADD COLUMN IF NOT EXISTS scan_type text DEFAULT 'vulnerability';
ALTER TABLE scans ADD COLUMN IF NOT EXISTS target text DEFAULT '';
ALTER TABLE scans ADD COLUMN IF NOT EXISTS status text DEFAULT 'running';
ALTER TABLE scans ADD COLUMN IF NOT EXISTS severity_summary jsonb DEFAULT '{"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}'::jsonb;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS vulnerabilities_found integer DEFAULT 0;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS assets_scanned integer DEFAULT 0;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS started_at timestamptz DEFAULT now();
ALTER TABLE scans ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS duration_seconds integer;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE scans ADD COLUMN IF NOT EXISTS asset_id uuid;
END IF; END $$;

-- ============ VULNERABILITIES ============
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vulnerabilities') THEN
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS scan_id uuid;
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS cve_id text;
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS title text DEFAULT '';
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS severity text DEFAULT 'medium';
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS cvss_score numeric(3,1);
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS affected_asset text DEFAULT '';
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS port integer;
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS service text;
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS remediation text;
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS status text DEFAULT 'open';
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS asset_id uuid;
END IF; END $$;

-- ============ ASSETS ============
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'assets') THEN
ALTER TABLE assets ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();
ALTER TABLE assets ADD COLUMN IF NOT EXISTS name text DEFAULT '';
ALTER TABLE assets ADD COLUMN IF NOT EXISTS type text DEFAULT 'server';
ALTER TABLE assets ADD COLUMN IF NOT EXISTS ip_address text;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS hostname text;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS operating_system text;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS criticality text DEFAULT 'medium';
ALTER TABLE assets ADD COLUMN IF NOT EXISTS last_scan_at timestamptz;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS vulnerability_count integer DEFAULT 0;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
ALTER TABLE assets ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE assets ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
END IF; END $$;

-- ============ MONITORING_CHECKS ============
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'monitoring_checks') THEN
ALTER TABLE monitoring_checks ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();
ALTER TABLE monitoring_checks ADD COLUMN IF NOT EXISTS check_name text DEFAULT '';
ALTER TABLE monitoring_checks ADD COLUMN IF NOT EXISTS check_type text DEFAULT '';
ALTER TABLE monitoring_checks ADD COLUMN IF NOT EXISTS target text DEFAULT '';
ALTER TABLE monitoring_checks ADD COLUMN IF NOT EXISTS status text DEFAULT 'unknown';
ALTER TABLE monitoring_checks ADD COLUMN IF NOT EXISTS last_check timestamptz DEFAULT now();
ALTER TABLE monitoring_checks ADD COLUMN IF NOT EXISTS response_time int DEFAULT 0;
ALTER TABLE monitoring_checks ADD COLUMN IF NOT EXISTS uptime_percentage numeric(5,2) DEFAULT 100.00;
ALTER TABLE monitoring_checks ADD COLUMN IF NOT EXISTS details jsonb DEFAULT '{}'::jsonb;
ALTER TABLE monitoring_checks ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE monitoring_checks ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
END IF; END $$;

-- ============ COMPLIANCE_AUDITS ============
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'compliance_audits') THEN
ALTER TABLE compliance_audits ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();
ALTER TABLE compliance_audits ADD COLUMN IF NOT EXISTS framework text DEFAULT '';
ALTER TABLE compliance_audits ADD COLUMN IF NOT EXISTS requirement text DEFAULT '';
ALTER TABLE compliance_audits ADD COLUMN IF NOT EXISTS status text DEFAULT 'not_applicable';
ALTER TABLE compliance_audits ADD COLUMN IF NOT EXISTS score numeric(5,2) DEFAULT 0;
ALTER TABLE compliance_audits ADD COLUMN IF NOT EXISTS evidence text DEFAULT '';
ALTER TABLE compliance_audits ADD COLUMN IF NOT EXISTS last_audit timestamptz DEFAULT now();
ALTER TABLE compliance_audits ADD COLUMN IF NOT EXISTS next_audit timestamptz;
ALTER TABLE compliance_audits ADD COLUMN IF NOT EXISTS owner text DEFAULT '';
ALTER TABLE compliance_audits ADD COLUMN IF NOT EXISTS notes text DEFAULT '';
ALTER TABLE compliance_audits ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE compliance_audits ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
END IF; END $$;

-- ============ TRAINING_MODULES ============
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'training_modules') THEN
ALTER TABLE training_modules ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();
ALTER TABLE training_modules ADD COLUMN IF NOT EXISTS title text DEFAULT '';
ALTER TABLE training_modules ADD COLUMN IF NOT EXISTS category text DEFAULT '';
ALTER TABLE training_modules ADD COLUMN IF NOT EXISTS description text DEFAULT '';
ALTER TABLE training_modules ADD COLUMN IF NOT EXISTS duration_minutes int DEFAULT 0;
ALTER TABLE training_modules ADD COLUMN IF NOT EXISTS completion_rate numeric(5,2) DEFAULT 0;
ALTER TABLE training_modules ADD COLUMN IF NOT EXISTS passing_score numeric(5,2) DEFAULT 80.00;
ALTER TABLE training_modules ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
ALTER TABLE training_modules ADD COLUMN IF NOT EXISTS total_enrolled int DEFAULT 0;
ALTER TABLE training_modules ADD COLUMN IF NOT EXISTS total_completed int DEFAULT 0;
ALTER TABLE training_modules ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE training_modules ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
END IF; END $$;

-- ============ INCIDENTS ============
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'incidents') THEN
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS title text DEFAULT '';
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS severity text DEFAULT '';
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS status text DEFAULT 'open';
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS category text DEFAULT '';
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS description text DEFAULT '';
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS affected_systems text[] DEFAULT ARRAY[]::text[];
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS detected_at timestamptz DEFAULT now();
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS resolved_at timestamptz;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS assigned_to text DEFAULT '';
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS impact text DEFAULT '';
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS response_actions text DEFAULT '';
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
END IF; END $$;

-- Ensure cve_id is text (migration had integer)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'vulnerabilities' AND column_name = 'cve_id' AND data_type = 'integer') THEN
    ALTER TABLE vulnerabilities ALTER COLUMN cve_id TYPE text USING cve_id::text;
  END IF;
END $$;
