import { useState, useEffect } from 'react';
import { incidentsService, Incident } from '../services/incidentsService';

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [incidentsData, metricsData] = await Promise.all([
        incidentsService.getIncidents(),
        incidentsService.getMetrics()
      ]);
      setIncidents(incidentsData);
      setMetrics(metricsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch incidents data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { incidents, metrics, loading, error, refresh: fetchData };
}
