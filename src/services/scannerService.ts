import { supabase } from './supabaseClient';

export interface Scan {
  id: string;
  scan_type: string;
  target: string;
  status: string;
  severity_summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  vulnerabilities_found: number;
  assets_scanned: number;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  created_at: string;
}

export interface Vulnerability {
  id: string;
  scan_id: string;
  cve_id: string | null;
  title: string;
  description: string | null;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  cvss_score: number | null;
  affected_asset: string;
  port: number | null;
  service: string | null;
  remediation: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  ip_address: string | null;
  hostname: string | null;
  operating_system: string | null;
  location: string | null;
  criticality: string;
  last_scan_at: string | null;
  vulnerability_count: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ScannerMetrics {
  totalScans: number;
  activeScans: number;
  totalVulnerabilities: number;
  criticalVulnerabilities: number;
  highVulnerabilities: number;
  assetsMonitored: number;
  lastScanTime: string | null;
}

class ScannerService {
  async getMetrics(): Promise<ScannerMetrics> {
    const [scansResult, vulnerabilitiesResult, assetsResult] = await Promise.all([
      supabase.from('scans').select('id', { count: 'exact', head: true }),
      supabase.from('vulnerabilities').select('severity', { count: 'exact' }),
      supabase.from('assets').select('id', { count: 'exact', head: true })
    ]);

    if (scansResult.error) throw new Error(scansResult.error.message);
    if (vulnerabilitiesResult.error) throw new Error(vulnerabilitiesResult.error.message);
    if (assetsResult.error) throw new Error(assetsResult.error.message);

    const activeScansResult = await supabase
      .from('scans')
      .select('id', { count: 'exact' })
      .eq('status', 'running');

    const lastScanResult = await supabase
      .from('scans')
      .select('completed_at')
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (activeScansResult.error) throw new Error(activeScansResult.error.message);
    if (lastScanResult.error) throw new Error(lastScanResult.error.message);

    const criticalCount = vulnerabilitiesResult.data?.filter(v => v.severity === 'critical').length || 0;
    const highCount = vulnerabilitiesResult.data?.filter(v => v.severity === 'high').length || 0;

    return {
      totalScans: scansResult.count ?? 0,
      activeScans: activeScansResult.count ?? 0,
      totalVulnerabilities: vulnerabilitiesResult.count ?? 0,
      criticalVulnerabilities: criticalCount,
      highVulnerabilities: highCount,
      assetsMonitored: assetsResult.count ?? 0,
      lastScanTime: lastScanResult.data?.completed_at ?? null
    };
  }

  async getRecentScans(limit: number = 10): Promise<Scan[]> {
    const { data, error } = await supabase
      .from('scans')
      .select('id, scan_type, target, status, severity_summary, vulnerabilities_found, assets_scanned, started_at, completed_at, duration_seconds, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getScanById(id: string): Promise<Scan | null> {
    const { data, error } = await supabase
      .from('scans')
      .select('id, scan_type, target, status, severity_summary, vulnerabilities_found, assets_scanned, started_at, completed_at, duration_seconds, created_at')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  }

  async getVulnerabilitiesByScan(scanId: string): Promise<Vulnerability[]> {
    const { data, error } = await supabase
      .from('vulnerabilities')
      .select('id, scan_id, cve_id, title, description, severity, cvss_score, affected_asset, port, service, remediation, status, created_at, updated_at')
      .eq('scan_id', scanId)
      .order('severity', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getAllVulnerabilities(limit: number = 50): Promise<Vulnerability[]> {
    const { data, error } = await supabase
      .from('vulnerabilities')
      .select('id, scan_id, cve_id, title, description, severity, cvss_score, affected_asset, port, service, remediation, status, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getVulnerabilitiesByStatus(status: string): Promise<Vulnerability[]> {
    const { data, error } = await supabase
      .from('vulnerabilities')
      .select('id, scan_id, cve_id, title, description, severity, cvss_score, affected_asset, port, service, remediation, status, created_at, updated_at')
      .eq('status', status)
      .order('severity', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getAssets(): Promise<Asset[]> {
    const { data, error } = await supabase
      .from('assets')
      .select('id, name, type, ip_address, hostname, operating_system, location, criticality, last_scan_at, vulnerability_count, status, created_at, updated_at')
      .order('criticality', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getAssetById(id: string): Promise<Asset | null> {
    const { data, error } = await supabase
      .from('assets')
      .select('id, name, type, ip_address, hostname, operating_system, location, criticality, last_scan_at, vulnerability_count, status, created_at, updated_at')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateVulnerabilityStatus(id: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('vulnerabilities')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  async createScan(scan: Partial<Scan>): Promise<Scan> {
    const row = {
      scan_type: scan.scan_type ?? 'vulnerability',
      target: scan.target ?? '',
      status: scan.status ?? 'running',
      severity_summary: scan.severity_summary ?? { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
      vulnerabilities_found: scan.vulnerabilities_found ?? 0,
      assets_scanned: scan.assets_scanned ?? 0,
      started_at: scan.started_at ?? new Date().toISOString()
    };
    const { data, error } = await supabase
      .from('scans')
      .insert(row)
      .select('id, scan_type, target, status, severity_summary, vulnerabilities_found, assets_scanned, started_at, completed_at, duration_seconds, created_at')
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to create scan');
    }
    return data;
  }

  async updateScan(id: string, updates: Partial<Scan>): Promise<void> {
    const { error } = await supabase
      .from('scans')
      .update(updates)
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  async getSeverityDistribution(): Promise<{ name: string; value: number; color: string }[]> {
    const { data, error } = await supabase
      .from('vulnerabilities')
      .select('severity');

    if (error) throw new Error(error.message);

    const counts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0
    };

    data?.forEach(v => {
      if (v.severity in counts) {
        counts[v.severity as keyof typeof counts]++;
      }
    });

    return [
      { name: 'Critical', value: counts.critical, color: '#ef4444' },
      { name: 'High', value: counts.high, color: '#f97316' },
      { name: 'Medium', value: counts.medium, color: '#eab308' },
      { name: 'Low', value: counts.low, color: '#3b82f6' },
      { name: 'Info', value: counts.info, color: '#6b7280' }
    ];
  }
}

export const scannerService = new ScannerService();
