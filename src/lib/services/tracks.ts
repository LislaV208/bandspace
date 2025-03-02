// import { supabase } from '$lib/supabase';
// import type { Database } from '$lib/database.types';

// export type Track = Database['public']['Tables']['tracks']['Row'];

// export const tracksService = {
//   async getTracks(projectId: number): Promise<Track[]> {
//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) throw new Error('Not authenticated');

//     const { data, error } = await supabase
//       .from('tracks')
//       .select('*')
//       .eq('project_id', projectId);

//     if (error) throw error;
//     return data;
//   },

//   async createTrack(name: string, projectId: number): Promise<Track> {
//     const { data, error } = await supabase
//       .from('tracks')
//       .insert([{ name, project_id: projectId }])
//       .select()
//       .single();

//     if (error) throw error;
//     return data;
//   },

//   async deleteTrack(trackId: number): Promise<void> {
//     const { error } = await supabase
//       .from('tracks')
//       .delete()
//       .eq('id', trackId);

//     if (error) throw error;
//   }
// };