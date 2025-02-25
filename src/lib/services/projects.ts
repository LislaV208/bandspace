import { supabase } from '$lib/supabase';
import type { Database } from '$lib/database.types';

export type Project = Database['public']['Tables']['projects']['Row'];

export const projectsService = {
  async getProjects(): Promise<Project[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('projects')
      .select('*, projects_users!inner(*)')
      .eq('projects_users.user_id', user.id);

    if (error) throw error;
    return data;
  },

  async createProject(name: string): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert([{ name }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};