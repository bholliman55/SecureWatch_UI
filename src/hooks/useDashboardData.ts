import { useState, useEffect, useCallback } from 'react';
import { dashboardService, DashboardMetrics, Alert, Activity, SecurityPostureData, AgentStatus } from '../services/dashboardService';

interface UseDashboardDataReturn {
  metrics: DashboardMetrics | null;
  alerts: Alert[];
  timeline: Activity[];
  posture: SecurityPostureData[];
  agents: AgentStatus[];
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

export function useDashboardData(
  autoRefreshInterval: number = 30000
): UseDashboardDataReturn {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [timeline, setTimeline] = useState<Activity[]>([]);
  const [posture, setPosture] = useState<SecurityPostureData[]>([]);
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [metricsData, alertsData, timelineData, postureData, agentsData] =
        await Promise.all([
          dashboardService.getDashboardMetrics().catch(() => DEFAULT_METRICS),
          dashboardService.getRecentAlerts(10).catch(() => []),
          dashboardService.getActivityTimeline(20).catch(() => []),
          dashboardService.getSecurityPosture().catch(() => []),
          dashboardService.getAgentStatus().catch(() => [])
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
