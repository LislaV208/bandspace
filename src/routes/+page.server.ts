// import { projectsService } from '$lib/services/projects';
// import type { PageServerLoad } from './projects/$types';

// export const load: PageServerLoad = async () => {
//   try {
//     const projects = await projectsService.getProjects();
//     return {
//       projects
//     };
//   } catch (error) {
//     console.error('Error loading projects:', error);
//     return {
//       projects: [],
//       error: 'Failed to load projects'
//     };
//   }
// };