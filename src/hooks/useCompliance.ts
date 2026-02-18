import { useState, useEffect } from 'react';
import { complianceService, ComplianceAudit } from '../services/complianceService';

export function useCompliance() {
  const [audits, setAudits] = useState<ComplianceAudit[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [auditsData, metricsData] = await Promise.all([
        complianceService.getAudits(),
        complianceService.getMetrics()
      ]);
      setAudits(auditsData);
      setMetrics(metricsData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : (err as { message?: string })?.message ?? 'Failed to fetch compliance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { audits, metrics, loading, error, refresh: fetchData };
}
