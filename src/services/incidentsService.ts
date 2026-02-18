import { supabase } from './supabaseClient';

export interface Incident {
  id: string;
  title: string;
  severity: string;
  status: string;
  category: string;
  description: string;
  affected_systems: string[];
  detected_at: string;
  resolved_at: string | null;
  assigned_to: string;
  impact: string;
  response_actions: string;
  created_at: string;
  updated_at: string;
}

export const incidentsService = {
  async getIncidents(): Promise<Incident[]> {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('detected_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getMetrics() {
    const incidents = await this.getIncidents();

    const statusCounts = incidents.reduce((acc, incident) => {
      acc[incident.status] = (acc[incident.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const severityCounts = incidents.reduce((acc, incident) => {
      acc[incident.severity] = (acc[incident.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const resolvedIncidents = incidents.filter(i => i.resolved_at);
    const avgResolutionTime = resolvedIncidents.length > 0
      ? resolvedIncidents.reduce((sum, incident) => {
          const detected = new Date(incident.detected_at).getTime();
          const resolved = new Date(incident.resolved_at!).getTime();
          return sum + (resolved - detected);
        }, 0) / resolvedIncidents.length / (1000 * 60 * 60)
      : 0;

    return {
      total: incidents.length,
      open: statusCounts.open || 0,
      investigating: statusCounts.investigating || 0,
      resolved: statusCounts.resolved || 0,
      closed: statusCounts.closed || 0,
      critical: severityCounts.critical || 0,
      high: severityCounts.high || 0,
      medium: severityCounts.medium || 0,
      low: severityCounts.low || 0,
      avgResolutionTimeHours: Number(avgResolutionTime.toFixed(1))
    };
  }
};
