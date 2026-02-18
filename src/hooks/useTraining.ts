import { useState, useEffect } from 'react';
import { trainingService, TrainingModule } from '../services/trainingService';

export function useTraining() {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [modulesData, metricsData] = await Promise.all([
        trainingService.getModules(),
        trainingService.getMetrics()
      ]);
      setModules(modulesData);
      setMetrics(metricsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch training data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { modules, metrics, loading, error, refresh: fetchData };
}
