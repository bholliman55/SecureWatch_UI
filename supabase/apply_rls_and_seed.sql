-- SecureWatch: Apply RLS policies and seed data
-- Run this in Supabase SQL Editor after the tables exist (run create_* migrations first if needed).
-- Safe to run multiple times (drops then recreates policies).
-- If you see "asset_id does not exist", run supabase/fix_asset_id_and_policies.sql first, then this again.

-- ============ OPTIONAL: Fix asset_id if policies expect it ============
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS asset_id uuid REFERENCES assets(id) ON DELETE SET NULL;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS asset_id uuid REFERENCES assets(id) ON DELETE SET NULL;

-- ============ SCANS ============
DROP POLICY IF EXISTS "Anonymous users can view all scans" ON scans;
CREATE POLICY "Anonymous users can view all scans"
  ON scans FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Anonymous users can insert scans" ON scans;
CREATE POLICY "Anonymous users can insert scans"
  ON scans FOR INSERT TO anon WITH CHECK (true);

-- ============ VULNERABILITIES ============
DROP POLICY IF EXISTS "Anonymous users can view all vulnerabilities" ON vulnerabilities;
CREATE POLICY "Anonymous users can view all vulnerabilities"
  ON vulnerabilities FOR SELECT TO anon USING (true);

-- ============ ASSETS ============
DROP POLICY IF EXISTS "Anonymous users can view all assets" ON assets;
CREATE POLICY "Anonymous users can view all assets"
  ON assets FOR SELECT TO anon USING (true);

-- ============ MONITORING_CHECKS ============
DROP POLICY IF EXISTS "Allow anonymous read access to monitoring_checks" ON monitoring_checks;
CREATE POLICY "Allow anonymous read access to monitoring_checks"
  ON monitoring_checks FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow anonymous insert to monitoring_checks" ON monitoring_checks;
CREATE POLICY "Allow anonymous insert to monitoring_checks"
  ON monitoring_checks FOR INSERT TO anon WITH CHECK (true);

-- ============ COMPLIANCE_AUDITS ============
DROP POLICY IF EXISTS "Allow anonymous read access to compliance_audits" ON compliance_audits;
CREATE POLICY "Allow anonymous read access to compliance_audits"
  ON compliance_audits FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow anonymous insert to compliance_audits" ON compliance_audits;
CREATE POLICY "Allow anonymous insert to compliance_audits"
  ON compliance_audits FOR INSERT TO anon WITH CHECK (true);

-- ============ TRAINING_MODULES ============
DROP POLICY IF EXISTS "Allow anonymous read access to training_modules" ON training_modules;
CREATE POLICY "Allow anonymous read access to training_modules"
  ON training_modules FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow anonymous insert to training_modules" ON training_modules;
CREATE POLICY "Allow anonymous insert to training_modules"
  ON training_modules FOR INSERT TO anon WITH CHECK (true);

-- ============ INCIDENTS ============
DROP POLICY IF EXISTS "Allow anonymous read access to incidents" ON incidents;
CREATE POLICY "Allow anonymous read access to incidents"
  ON incidents FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow anonymous insert to incidents" ON incidents;
CREATE POLICY "Allow anonymous insert to incidents"
  ON incidents FOR INSERT TO anon WITH CHECK (true);

-- ============ SEED DATA (only inserts when table is empty; safe to run multiple times) ============
INSERT INTO monitoring_checks (check_name, check_type, target, status, response_time, uptime_percentage, last_check)
SELECT 'API Health', 'uptime', 'https://api.example.com/health', 'healthy', 45, 99.99, now() - interval '5 minutes'
WHERE NOT EXISTS (SELECT 1 FROM monitoring_checks LIMIT 1);
INSERT INTO monitoring_checks (check_name, check_type, target, status, response_time, uptime_percentage, last_check)
SELECT 'Database Latency', 'performance', 'Primary DB', 'healthy', 12, 100.00, now() - interval '2 minutes'
WHERE NOT EXISTS (SELECT 1 FROM monitoring_checks LIMIT 1);
INSERT INTO monitoring_checks (check_name, check_type, target, status, response_time, uptime_percentage, last_check)
SELECT 'Auth Service', 'security', 'auth.example.com', 'healthy', 28, 99.95, now() - interval '1 minute'
WHERE NOT EXISTS (SELECT 1 FROM monitoring_checks LIMIT 1);
INSERT INTO monitoring_checks (check_name, check_type, target, status, response_time, uptime_percentage, last_check)
SELECT 'Web Server', 'uptime', 'web.example.com', 'warning', 320, 98.50, now() - interval '10 minutes'
WHERE NOT EXISTS (SELECT 1 FROM monitoring_checks LIMIT 1);

INSERT INTO compliance_audits (framework, requirement, status, score, last_audit, owner)
SELECT 'SOC 2', 'Access Control', 'compliant', 95.00, now() - interval '7 days', 'Security Team'
WHERE NOT EXISTS (SELECT 1 FROM compliance_audits LIMIT 1);
INSERT INTO compliance_audits (framework, requirement, status, score, last_audit, owner)
SELECT 'SOC 2', 'Encryption at Rest', 'compliant', 100.00, now() - interval '14 days', 'DevOps'
WHERE NOT EXISTS (SELECT 1 FROM compliance_audits LIMIT 1);
INSERT INTO compliance_audits (framework, requirement, status, score, last_audit, owner)
SELECT 'PCI-DSS', 'Requirement 8', 'partial', 72.00, now() - interval '21 days', 'IT'
WHERE NOT EXISTS (SELECT 1 FROM compliance_audits LIMIT 1);
INSERT INTO compliance_audits (framework, requirement, status, score, last_audit, owner)
SELECT 'HIPAA', 'Audit Controls', 'compliant', 88.00, now() - interval '30 days', 'Compliance'
WHERE NOT EXISTS (SELECT 1 FROM compliance_audits LIMIT 1);

INSERT INTO training_modules (title, category, description, duration_minutes, completion_rate, total_enrolled, total_completed, status)
SELECT 'Phishing Awareness', 'security_awareness', 'Identify and report phishing attempts', 15, 87.50, 120, 105, 'active'
WHERE NOT EXISTS (SELECT 1 FROM training_modules LIMIT 1);
INSERT INTO training_modules (title, category, description, duration_minutes, completion_rate, total_enrolled, total_completed, status)
SELECT 'Data Privacy', 'compliance', 'GDPR and data handling best practices', 30, 92.00, 80, 74, 'active'
WHERE NOT EXISTS (SELECT 1 FROM training_modules LIMIT 1);
INSERT INTO training_modules (title, category, description, duration_minutes, completion_rate, total_enrolled, total_completed, status)
SELECT 'Incident Response', 'operational', 'Security incident reporting procedures', 20, 65.00, 45, 29, 'active'
WHERE NOT EXISTS (SELECT 1 FROM training_modules LIMIT 1);

INSERT INTO incidents (title, severity, status, category, description, affected_systems, detected_at, assigned_to)
SELECT 'Suspicious login attempts', 'high', 'investigating', 'unauthorized_access', 'Multiple failed logins from unknown IP', ARRAY['auth-service'], now() - interval '2 hours', 'SOC Analyst'
WHERE NOT EXISTS (SELECT 1 FROM incidents LIMIT 1);
INSERT INTO incidents (title, severity, status, category, description, affected_systems, detected_at, assigned_to)
SELECT 'Outdated SSL certificate', 'medium', 'open', 'compliance', 'Web server cert expires in 14 days', ARRAY['web-01'], now() - interval '1 day', 'DevOps'
WHERE NOT EXISTS (SELECT 1 FROM incidents LIMIT 1);
