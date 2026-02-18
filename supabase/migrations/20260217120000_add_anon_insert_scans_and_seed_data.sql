/*
  # Add Anonymous INSERT for Scans + Seed Data for Empty Tables

  1. Allows anonymous users to INSERT into scans (for NewScanModal without auth)
  2. Adds sample data for monitoring_checks, compliance_audits, training_modules, incidents
     so the dashboard displays meaningful data on first run
*/

-- Allow anonymous users to create scans (for New Scan modal)
CREATE POLICY "Anonymous users can insert scans"
  ON scans FOR INSERT
  TO anon
  WITH CHECK (true);

-- Seed monitoring_checks
INSERT INTO monitoring_checks (check_name, check_type, target, status, response_time, uptime_percentage, last_check)
VALUES
  ('API Health', 'uptime', 'https://api.example.com/health', 'healthy', 45, 99.99, now() - interval '5 minutes'),
  ('Database Latency', 'performance', 'Primary DB', 'healthy', 12, 100.00, now() - interval '2 minutes'),
  ('Auth Service', 'security', 'auth.example.com', 'healthy', 28, 99.95, now() - interval '1 minute'),
  ('Web Server', 'uptime', 'web.example.com', 'warning', 320, 98.50, now() - interval '10 minutes');

-- Seed compliance_audits
INSERT INTO compliance_audits (framework, requirement, status, score, last_audit, owner)
VALUES
  ('SOC 2', 'Access Control', 'compliant', 95.00, now() - interval '7 days', 'Security Team'),
  ('SOC 2', 'Encryption at Rest', 'compliant', 100.00, now() - interval '14 days', 'DevOps'),
  ('PCI-DSS', 'Requirement 8', 'partial', 72.00, now() - interval '21 days', 'IT'),
  ('HIPAA', 'Audit Controls', 'compliant', 88.00, now() - interval '30 days', 'Compliance');

-- Seed training_modules
INSERT INTO training_modules (title, category, description, duration_minutes, completion_rate, total_enrolled, total_completed, status)
VALUES
  ('Phishing Awareness', 'security_awareness', 'Identify and report phishing attempts', 15, 87.50, 120, 105, 'active'),
  ('Data Privacy', 'compliance', 'GDPR and data handling best practices', 30, 92.00, 80, 74, 'active'),
  ('Incident Response', 'operational', 'Security incident reporting procedures', 20, 65.00, 45, 29, 'active');

-- Seed incidents
INSERT INTO incidents (title, severity, status, category, description, affected_systems, detected_at, assigned_to)
VALUES
  ('Suspicious login attempts', 'high', 'investigating', 'unauthorized_access', 'Multiple failed logins from unknown IP', ARRAY['auth-service'], now() - interval '2 hours', 'SOC Analyst'),
  ('Outdated SSL certificate', 'medium', 'open', 'compliance', 'Web server cert expires in 14 days', ARRAY['web-01'], now() - interval '1 day', 'DevOps');
