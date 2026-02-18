import { supabase } from './supabaseClient';

export interface TrainingModule {
  id: string;
  title: string;
  category: string;
  description: string;
  duration_minutes: number;
  completion_rate: number;
  passing_score: number;
  status: string;
  total_enrolled: number;
  total_completed: number;
  created_at: string;
  updated_at: string;
}

export const trainingService = {
  async getModules(): Promise<TrainingModule[]> {
    const { data, error } = await supabase
      .from('training_modules')
      .select('id, title, category, description, duration_minutes, completion_rate, passing_score, status, total_enrolled, total_completed, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async getMetrics() {
    const modules = await this.getModules();

    const totalEnrolled = modules.reduce((sum, mod) => sum + mod.total_enrolled, 0);
    const totalCompleted = modules.reduce((sum, mod) => sum + mod.total_completed, 0);
    const avgCompletionRate = modules.length > 0
      ? modules.reduce((sum, mod) => sum + Number(mod.completion_rate), 0) / modules.length
      : 0;

    const categoryStats = modules.reduce((acc, mod) => {
      if (!acc[mod.category]) {
        acc[mod.category] = { total: 0, completed: 0 };
      }
      acc[mod.category].total += mod.total_enrolled;
      acc[mod.category].completed += mod.total_completed;
      return acc;
    }, {} as Record<string, { total: number; completed: number }>);

    return {
      totalModules: modules.length,
      activeModules: modules.filter(m => m.status === 'active').length,
      totalEnrolled,
      totalCompleted,
      avgCompletionRate: Number(avgCompletionRate.toFixed(1)),
      categoryStats: Object.entries(categoryStats).map(([name, data]) => ({
        name,
        enrolled: data.total,
        completed: data.completed,
        rate: data.total > 0 ? Number(((data.completed / data.total) * 100).toFixed(1)) : 0
      }))
    };
  }
};
