import type { ProjectRepository } from "$lib/repositories/ProjectRepository";
import type { DashboardProject, Project } from "$lib/types/project";
import type { Track } from "$lib/types/track";

export class ProjectService {
  private projectRepository: ProjectRepository;

  constructor(projectRepository: ProjectRepository) {
    this.projectRepository = projectRepository;
  }

  /**
   * Pobiera wszystkie projekty użytkownika wraz z dodatkowymi danymi
   * @param userId ID użytkownika
   * @returns Lista projektów z dodatkowymi danymi
   */
  async getUserProjects(userId: string): Promise<DashboardProject[]> {
    // Pobierz projekty użytkownika
    const { data, error } = await this.projectRepository.getUserProjects(
      userId
    );

    if (error) {
      console.error("Error fetching projects:", error);
      throw new Error(error.message);
    }

    if (!data) {
      return [];
    }

    // Przekształć dane do wymaganego formatu
    const transformedData = data.map((project) => ({
      ...project,
      members_count: project.members_count[0]?.count || 0,
      recent_tracks: [] as Track[],
      members: [],
    })) as DashboardProject[];

    // Pobierz dodatkowe dane dla każdego projektu
    for (const project of transformedData) {
      await this.enrichProjectWithAdditionalData(project);
    }

    return transformedData;
  }

  /**
   * Wzbogaca projekt o dodatkowe dane (utwory, członkowie)
   * @param project Projekt do wzbogacenia
   */
  private async enrichProjectWithAdditionalData(
    project: DashboardProject
  ): Promise<void> {
    // Pobierz ostatnie utwory
    const { data: tracks, error: tracksError } =
      await this.projectRepository.getRecentTracks(project.id as number);

    if (tracksError) {
      console.error(
        `Error fetching tracks for project ${project.id}:`,
        tracksError
      );
    } else {
      project.recent_tracks = tracks || [];
    }

    // Pobierz członków projektu
    const { data: members, error: membersError } =
      await this.projectRepository.getProjectMembers(project.id as number);

    if (membersError) {
      console.error(
        `Error fetching members for project ${project.id}:`,
        membersError
      );
    } else {
      // Przekształć dane członków projektu
      project.members = members?.map((m) => m.user) || [];
    }
  }

  /**
   * Tworzy nowy projekt
   * @param name Nazwa projektu
   * @returns Utworzony projekt
   */
  async createProject(name: string): Promise<Project> {
    if (!name || typeof name !== "string" || name.trim() === "") {
      throw new Error("Nazwa projektu nie może być pusta");
    }

    const { data, error } = await this.projectRepository.createProject(name);

    if (error) {
      console.error("Error creating project:", error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Nie udało się utworzyć projektu");
    }

    return data;
  }
}
