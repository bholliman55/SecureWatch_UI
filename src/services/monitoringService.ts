import { supabase } from './supabaseClient';

export interface MonitoringCheck {
  id: string;
  check_name: string;
  check_type: string;
  target: string;
  status: string;
  last_check: string;
  response_time: number;
  uptime_percentage: number;
  details: any;
  created_at: string;
  updated_at: string;
}

export const monitoringService = {
  async getChecks(): Promise<MonitoringCheck[]> {
    const { data, error } = await supabase
      .from('monitoring_checks')
      .select('id, check_name, check_type, target, status, last_check, response_time, uptime_percentage, details, created_at, updated_at')
      .order('last_check', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async getMetrics() {
    const checks = await this.getChecks();

    const statusCounts = checks.reduce((acc, check) => {
      acc[check.status] = (acc[check.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgResponseTime = checks.length > 0
      ? checks.reduce((sum, check) => sum + check.response_time, 0) / checks.length
      : 0;

    const avgUptime = checks.length > 0
      ? checks.reduce((sum, check) => sum + Number(check.uptime_percentage), 0) / checks.length
      : 100;

    return {
      total: checks.length,
      healthy: statusCounts.healthy || 0,
      warning: statusCounts.warning || 0,
      critical: statusCounts.critical || 0,
      avgResponseTime: Math.round(avgResponseTime),
      avgUptime: Number(avgUptime.toFixed(2))
    };
  }
};
