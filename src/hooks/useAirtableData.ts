import { useState, useEffect, useCallback } from 'react';
import { airtableService } from '../services/airtableService';

interface DashboardMetrics {
  activeThreats: number;
  openIncidents: number;
  complianceScore: number;
  trainingCompletion: number;
  lastUpdated: string;
}

interface UseAirtableDataReturn {
  metrics: DashboardMetrics | null;
  alerts: any[];
  timeline: any[];
  posture: any[];
  agents: any[];
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  lastUpdated: string | null;
  refresh: () => Promise<void>;
}

const DEFAULT_METRICS: DashboardMetrics = {
  activeThreats: 0,
  openIncidents: 0,
  complianceScore: 0,
  trainingCompletion: 0,
  lastUpdated: new Date().toISOString()
};

export function useAirtableData(
  autoRefreshInterval: number = 30000
): UseAirtableDataReturn {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [posture, setPosture] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const hasCredentials = airtableService.hasCredentials();

      if (!hasCredentials) {
        const loaded = await airtableService.loadCredentials();
        if (!loaded) {
          setIsConnected(false);
          setLoading(false);
          return;
        }
      }

      const [metricsData, alertsData, timelineData, postureData, agentsData] =
        await Promise.all([
          airtableService.getDashboardMetrics().catch(() => DEFAULT_METRICS),
          airtableService.getRecentAlerts(10).catch(() => []),
          airtableService.getActivityTimeline(20).catch(() => []),
          airtableService.getSecurityPosture().catch(() => []),
          airtableService.getAgentStatus().catch(() => [])
        ]);

      setMetrics(metricsData);
      setAlerts(alertsData);
      setTimeline(timelineData);
      setPosture(postureData);
      setAgents(agentsData);
      setIsConnected(true);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(message);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const interval = setInterval(refresh, autoRefreshInterval);
    return () => clearInterval(interval);
  }, [refresh, autoRefreshInterval]);

  return {
    metrics,
    alerts,
    timeline,
    posture,
    agents,
    loading,
    error,
    isConnected,
    lastUpdated,
    refresh
  };
}
