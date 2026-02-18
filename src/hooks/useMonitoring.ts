import { useState, useEffect } from 'react';
import { monitoringService, MonitoringCheck } from '../services/monitoringService';

export function useMonitoring() {
  const [checks, setChecks] = useState<MonitoringCheck[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [checksData, metricsData] = await Promise.all([
        monitoringService.getChecks(),
        monitoringService.getMetrics()
      ]);
      setChecks(checksData);
      setMetrics(metricsData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : (err as { message?: string })?.message ?? 'Failed to fetch monitoring data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { checks, metrics, loading, error, refresh: fetchData };
}
