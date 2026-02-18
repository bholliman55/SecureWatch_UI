import { supabase } from './supabaseClient';

interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
  createdTime?: string;
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

class AirtableService {
  private baseId: string | null = null;
  private apiKey: string | null = null;

  async loadCredentials() {
    try {
      const { data, error } = await supabase
        .from('airtable_credentials')
        .select('base_id, api_key')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        this.baseId = data.base_id;
        this.apiKey = data.api_key;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading credentials:', error);
      return false;
    }
  }

  async saveCredentials(baseId: string, apiKey: string) {
    try {
      const { data: existing } = await supabase
        .from('airtable_credentials')
        .select('id')
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('airtable_credentials')
          .update({
            base_id: baseId,
            api_key: apiKey,
            is_connected: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('airtable_credentials')
          .insert({
            base_id: baseId,
            api_key: apiKey,
            is_connected: false
          });

        if (error) throw error;
      }

      this.baseId = baseId;
      this.apiKey = apiKey;
      return true;
    } catch (error) {
      console.error('Error saving credentials:', error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.baseId || !this.apiKey) {
      await this.loadCredentials();
    }

    if (!this.baseId || !this.apiKey) {
      throw new Error('No credentials configured');
    }

    try {
      const response = await fetch(
        `https://api.airtable.com/v0/meta/bases/${this.baseId}/tables`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        await this.updateConnectionStatus(true);
        return true;
      } else {
        await this.updateConnectionStatus(false);
        throw new Error(data.error?.message || 'Connection failed');
      }
    } catch (error) {
      await this.updateConnectionStatus(false);
      throw error;
    }
  }

  private async updateConnectionStatus(isConnected: boolean) {
    try {
      const { data: existing } = await supabase
        .from('airtable_credentials')
        .select('id')
        .maybeSingle();

      if (existing) {
        await supabase
          .from('airtable_credentials')
          .update({
            is_connected: isConnected,
            last_tested: new Date().toISOString()
          })
          .eq('id', existing.id);
      }
    } catch (error) {
      console.error('Error updating connection status:', error);
    }
  }

  async fetchTable(tableName: string, filters?: Record<string, any>): Promise<AirtableRecord[]> {
    if (!this.baseId || !this.apiKey) {
      await this.loadCredentials();
    }

    if (!this.baseId || !this.apiKey) {
      throw new Error('No credentials configured');
    }

    try {
      let url = `https://api.airtable.com/v0/${this.baseId}/${encodeURIComponent(tableName)}`;

      const params = new URLSearchParams();
      if (filters?.sort) {
        params.append('sort[0][field]', filters.sort.field);
        params.append('sort[0][direction]', filters.sort.direction || 'desc');
      }
      if (filters?.maxRecords) {
        params.append('maxRecords', filters.maxRecords.toString());
      }
      if (filters?.filterByFormula) {
        params.append('filterByFormula', filters.filterByFormula);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch from Airtable');
      }

      const data: AirtableResponse = await response.json();
      return data.records || [];
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      throw error;
    }
  }

  async getDashboardMetrics() {
    try {
      const [alerts, incidents, audits, assignments] = await Promise.all([
        this.fetchTable('Security_Alerts', { maxRecords: 100 }),
        this.fetchTable('Incidents', { maxRecords: 100 }),
        this.fetchTable('Compliance_Audits', { maxRecords: 100 }),
        this.fetchTable('Training_Assignments', { maxRecords: 100 })
      ]).catch(() => [[], [], [], []]);

      const activeThreats = alerts.filter(
        (a: any) => a.fields.Status !== 'Resolved'
      ).length;

      const openIncidents = incidents.filter(
        (i: any) => i.fields.Status !== 'Closed'
      ).length;

      const completedAudits = audits.filter(
        (a: any) => a.fields.Status === 'Completed'
      ).length;

      const complianceScore = audits.length > 0
        ? Math.round((completedAudits / audits.length) * 100)
        : 0;

      const completedAssignments = assignments.filter(
        (a: any) => a.fields.Status === 'Completed'
      ).length;

      const trainingCompletion = assignments.length > 0
        ? Math.round((completedAssignments / assignments.length) * 100)
        : 0;

      return {
        activeThreats,
        openIncidents,
        complianceScore: Math.min(complianceScore, 100),
        trainingCompletion: Math.min(trainingCompletion, 100),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }

  async getRecentAlerts(limit = 10) {
    try {
      const records = await this.fetchTable('Security_Alerts', {
        sort: { field: 'Created_Date', direction: 'desc' },
        maxRecords: limit
      });

      return records.map((r: any) => ({
        id: r.id,
        severity: r.fields.Severity || 'Medium',
        title: r.fields.Title || 'Unknown Alert',
        source: r.fields.Source_Agent || 'Unknown',
        timestamp: r.fields.Created_Date || new Date().toISOString(),
        description: r.fields.Description || ''
      }));
    } catch (error) {
      console.error('Error fetching recent alerts:', error);
      throw error;
    }
  }

  async getActivityTimeline(limit = 20) {
    try {
      const [alerts, incidents, audits] = await Promise.all([
        this.fetchTable('Security_Alerts', {
          sort: { field: 'Created_Date', direction: 'desc' },
          maxRecords: Math.ceil(limit / 3)
        }),
        this.fetchTable('Incidents', {
          sort: { field: 'Created_Date', direction: 'desc' },
          maxRecords: Math.ceil(limit / 3)
        }),
        this.fetchTable('Compliance_Audits', {
          sort: { field: 'Audit_Date', direction: 'desc' },
          maxRecords: Math.ceil(limit / 3)
        })
      ]).catch(() => [[], [], []]);

      const activities = [
        ...alerts.map((r: any) => ({
          id: `alert-${r.id}`,
          timestamp: r.fields.Created_Date,
          agent: 'Monitoring',
          agentIcon: 'Activity',
          description: r.fields.Title || 'Security alert',
          status: r.fields.Severity === 'Critical' ? 'Warning' : 'Success'
        })),
        ...incidents.map((r: any) => ({
          id: `incident-${r.id}`,
          timestamp: r.fields.Created_Date,
          agent: 'Incidents',
          agentIcon: 'AlertTriangle',
          description: r.fields.Title || 'Incident detected',
          status: r.fields.Status === 'Open' ? 'In Progress' : 'Success'
        })),
        ...audits.map((r: any) => ({
          id: `audit-${r.id}`,
          timestamp: r.fields.Audit_Date,
          agent: 'Compliance',
          agentIcon: 'ClipboardCheck',
          description: r.fields.Audit_Type || 'Compliance audit',
          status: r.fields.Status === 'Completed' ? 'Success' : 'In Progress'
        }))
      ];

      return activities.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ).slice(0, limit);
    } catch (error) {
      console.error('Error fetching activity timeline:', error);
      throw error;
    }
  }

  async getSecurityPosture() {
    try {
      const records = await this.fetchTable('Audit_Findings', { maxRecords: 200 });

      const severityCount = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        resolved: 0
      };

      records.forEach((r: any) => {
        const severity = (r.fields.Severity || 'low').toLowerCase();
        const status = (r.fields.Status || 'open').toLowerCase();

        if (status === 'resolved') {
          severityCount.resolved++;
        } else if (severity === 'critical') {
          severityCount.critical++;
        } else if (severity === 'high') {
          severityCount.high++;
        } else if (severity === 'medium') {
          severityCount.medium++;
        } else {
          severityCount.low++;
        }
      });

      return [
        { name: 'Critical', value: severityCount.critical, color: '#ef4444' },
        { name: 'High', value: severityCount.high, color: '#f97316' },
        { name: 'Medium', value: severityCount.medium, color: '#eab308' },
        { name: 'Low', value: severityCount.low, color: '#3b82f6' },
        { name: 'No Issues', value: severityCount.resolved, color: '#22c55e' }
      ];
    } catch (error) {
      console.error('Error fetching security posture:', error);
      throw error;
    }
  }

  async getAgentStatus() {
    try {
      const [vulnerabilities, alerts, audits, assignments, incidents] = await Promise.all([
        this.fetchTable('Scan_Results', {
          maxRecords: 1,
          sort: { field: 'Scan_Date', direction: 'desc' }
        }),
        this.fetchTable('Security_Alerts', {
          maxRecords: 1,
          sort: { field: 'Created_Date', direction: 'desc' }
        }),
        this.fetchTable('Compliance_Audits', {
          maxRecords: 1,
          sort: { field: 'Audit_Date', direction: 'desc' }
        }),
        this.fetchTable('Training_Assignments', {
          maxRecords: 1,
          sort: { field: 'Due_Date', direction: 'desc' }
        }),
        this.fetchTable('Incidents', {
          maxRecords: 1,
          sort: { field: 'Created_Date', direction: 'desc' }
        })
      ]).catch(() => [[], [], [], [], []]);

      return [
        {
          id: 1,
          name: 'Scanner',
          status: vulnerabilities.length > 0 ? 'Active' : 'Idle',
          lastActivity: vulnerabilities[0]?.fields.Scan_Date || new Date().toISOString()
        },
        {
          id: 2,
          name: 'Monitoring',
          status: alerts.length > 0 ? 'Active' : 'Idle',
          lastActivity: alerts[0]?.fields.Created_Date || new Date().toISOString()
        },
        {
          id: 3,
          name: 'Compliance',
          status: audits.length > 0 ? 'Active' : 'Idle',
          lastActivity: audits[0]?.fields.Audit_Date || new Date().toISOString()
        },
        {
          id: 4,
          name: 'Training',
          status: assignments.length > 0 ? 'Active' : 'Idle',
          lastActivity: assignments[0]?.fields.Due_Date || new Date().toISOString()
        },
        {
          id: 5,
          name: 'Incidents',
          status: incidents.length > 0 ? 'Active' : 'Idle',
          lastActivity: incidents[0]?.fields.Created_Date || new Date().toISOString()
        }
      ];
    } catch (error) {
      console.error('Error fetching agent status:', error);
      throw error;
    }
  }

  hasCredentials(): boolean {
    return !!this.baseId && !!this.apiKey;
  }

  clearCredentials() {
    this.baseId = null;
    this.apiKey = null;
  }
}

export const airtableService = new AirtableService();
