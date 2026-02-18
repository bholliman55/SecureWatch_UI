import { useState, useEffect, useCallback } from 'react';
import { scannerService, ScannerMetrics, Scan, Vulnerability, Asset } from '../services/scannerService';

interface UseScannerDataReturn {
  metrics: ScannerMetrics | null;
  scans: Scan[];
  vulnerabilities: Vulnerability[];
  assets: Asset[];
  severityDistribution: { name: string; value: number; color: string }[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useScannerData(): UseScannerDataReturn {
  const [metrics, setMetrics] = useState<ScannerMetrics | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [severityDistribution, setSeverityDistribution] = useState<{ name: string; value: number; color: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [metricsData, scansData, vulnerabilitiesData, assetsData, severityData] = await Promise.all([
        scannerService.getMetrics(),
        scannerService.getRecentScans(10),
        scannerService.getAllVulnerabilities(50),
        scannerService.getAssets(),
        scannerService.getSeverityDistribution()
      ]);

      setMetrics(metricsData);
      setScans(scansData);
      setVulnerabilities(vulnerabilitiesData);
      setAssets(assetsData);
      setSeverityDistribution(severityData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : (err as { message?: string })?.message ?? 'Failed to fetch scanner data';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    metrics,
    scans,
    vulnerabilities,
    assets,
    severityDistribution,
    loading,
    error,
    refresh
  };
}
