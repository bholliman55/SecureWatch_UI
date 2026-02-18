import { supabase } from './supabaseClient';

export interface ComplianceAudit {
  id: string;
  framework: string;
  requirement: string;
  status: string;
  score: number;
  evidence: string;
  last_audit: string;
  next_audit: string | null;
  owner: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export const complianceService = {
  async getAudits(): Promise<ComplianceAudit[]> {
    const { data, error } = await supabase
      .from('compliance_audits')
      .select('*')
      .order('last_audit', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getMetrics() {
    const audits = await this.getAudits();

    const statusCounts = audits.reduce((acc, audit) => {
      acc[audit.status] = (acc[audit.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const frameworkScores = audits.reduce((acc, audit) => {
      if (!acc[audit.framework]) {
        acc[audit.framework] = { total: 0, count: 0 };
      }
      acc[audit.framework].total += Number(audit.score);
      acc[audit.framework].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const overallScore = audits.length > 0
      ? audits.reduce((sum, audit) => sum + Number(audit.score), 0) / audits.length
      : 0;

    return {
      total: audits.length,
      compliant: statusCounts.compliant || 0,
      non_compliant: statusCounts.non_compliant || 0,
      partial: statusCounts.partial || 0,
      overallScore: Number(overallScore.toFixed(1)),
      frameworkScores: Object.entries(frameworkScores).map(([name, data]) => ({
        name,
        score: Number((data.total / data.count).toFixed(1))
      }))
    };
  }
};
