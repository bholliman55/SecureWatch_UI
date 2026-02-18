import { scannerService } from './scannerService';
import { monitoringService } from './monitoringService';
import { complianceService } from './complianceService';
import { trainingService } from './trainingService';
import { incidentsService } from './incidentsService';

export interface DashboardMetrics {
  activeThreats: number;
  openIncidents: number;
  complianceScore: number;
  trainingCompletion: number;
  lastUpdated: string;
}

export interface Alert {
  id: string;
  severity: string;
  title: string;
  source: string;
  timestamp: string;
  description: string;
}

export interface Activity {
  id: string;
  timestamp: string;
  agent: string;
  agentIcon: string;
  description: string;
  status: string;
}

export interface SecurityPostureData {
  name: string;
  value: number;
  color: string;
}

export interface AgentStatus {
  id: number;
  name: string;
  status: string;
  lastActivity: string;
}

class DashboardService {
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const [scannerMetrics, incidentsMetrics, complianceMetrics, trainingMetrics] = await Promise.all([
        scannerService.getMetrics().catch(() => null),
        incidentsService.getMetrics().catch(() => null),
        complianceService.getMetrics().catch(() => null),
        trainingService.getMetrics().catch(() => null)
      ]);

      const activeThreats = scannerMetrics?.criticalVulnerabilities || 0;
      const openIncidents = incidentsMetrics?.open || 0;
      const complianceScore = complianceMetrics?.overallScore || 0;
      const trainingCompletion = trainingMetrics?.avgCompletionRate || 0;

      return {
        activeThreats,
        openIncidents,
        complianceScore: Math.min(Math.round(complianceScore), 100),
        trainingCompletion: Math.min(Math.round(trainingCompletion), 100),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }

  async getRecentAlerts(limit = 10): Promise<Alert[]> {
    try {
      const vulnerabilities = await scannerService.getAllVulnerabilities(limit);

      return vulnerabilities.map(v => ({
        id: v.id,
        severity: v.severity.charAt(0).toUpperCase() + v.severity.slice(1),
        title: v.title,
        source: 'Scanner',
        timestamp: v.created_at,
        description: v.description || ''
      }));
    } catch (error) {
      console.error('Error fetching recent alerts:', error);
      return [];
    }
  }

  async getActivityTimeline(limit = 20): Promise<Activity[]> {
    try {
      const [vulnerabilities, incidents, audits] = await Promise.all([
        scannerService.getAllVulnerabilities(Math.ceil(limit / 3)).catch(() => []),
        incidentsService.getIncidents().catch(() => []),
        complianceService.getAudits().catch(() => [])
      ]);

      const activities: Activity[] = [
        ...vulnerabilities.slice(0, Math.ceil(limit / 3)).map(v => ({
          id: `vuln-${v.id}`,
          timestamp: v.created_at,
          agent: 'Scanner',
          agentIcon: 'Shield',
          description: `${v.severity.charAt(0).toUpperCase() + v.severity.slice(1)} vulnerability detected: ${v.title}`,
          status: v.severity === 'critical' ? 'Warning' : 'Success'
        })),
        ...incidents.slice(0, Math.ceil(limit / 3)).map(i => ({
          id: `incident-${i.id}`,
          timestamp: i.detected_at,
          agent: 'Incidents',
          agentIcon: 'AlertTriangle',
          description: i.title,
          status: i.status === 'open' ? 'In Progress' : 'Success'
        })),
        ...audits.slice(0, Math.ceil(limit / 3)).map(a => ({
          id: `audit-${a.id}`,
          timestamp: a.last_audit,
          agent: 'Compliance',
          agentIcon: 'ClipboardCheck',
          description: `${a.framework} - ${a.requirement}`,
          status: a.status === 'compliant' ? 'Success' : 'In Progress'
        }))
      ];

      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching activity timeline:', error);
      return [];
    }
  }

  async getSecurityPosture(): Promise<SecurityPostureData[]> {
    try {
      const severityDistribution = await scannerService.getSeverityDistribution();
      return severityDistribution;
    } catch (error) {
      console.error('Error fetching security posture:', error);
      return [];
    }
  }

  async getAgentStatus(): Promise<AgentStatus[]> {
    try {
      const [recentScans, checks, audits, modules, incidents] = await Promise.all([
        scannerService.getRecentScans(1).catch(() => []),
        monitoringService.getChecks().catch(() => []),
        complianceService.getAudits().catch(() => []),
        trainingService.getModules().catch(() => []),
        incidentsService.getIncidents().catch(() => [])
      ]);

      return [
        {
          id: 1,
          name: 'Scanner',
          status: recentScans.length > 0 && recentScans[0].status === 'running' ? 'Active' : 'Idle',
          lastActivity: recentScans[0]?.started_at || new Date().toISOString()
        },
        {
          id: 2,
          name: 'Monitoring',
          status: checks.length > 0 ? 'Active' : 'Idle',
          lastActivity: checks[0]?.last_check || new Date().toISOString()
        },
        {
          id: 3,
          name: 'Compliance',
          status: audits.length > 0 ? 'Active' : 'Idle',
          lastActivity: audits[0]?.last_audit || new Date().toISOString()
        },
        {
          id: 4,
          name: 'Training',
          status: modules.length > 0 && modules.filter(m => m.status === 'active').length > 0 ? 'Active' : 'Idle',
          lastActivity: modules[0]?.updated_at || new Date().toISOString()
        },
        {
          id: 5,
          name: 'Incidents',
          status: incidents.length > 0 && incidents.filter(i => i.status === 'open').length > 0 ? 'Active' : 'Idle',
          lastActivity: incidents[0]?.detected_at || new Date().toISOString()
        }
      ];
    } catch (error) {
      console.error('Error fetching agent status:', error);
      return [];
    }
  }
}

export const dashboardService = new DashboardService();
