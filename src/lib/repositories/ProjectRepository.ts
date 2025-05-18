import type { Database } from "$lib/database.types";
import type { Project } from "$lib/types/project";
import type { Track } from "$lib/types/track";
import type { User } from "$lib/types/user";
import type { SupabaseClient } from "@supabase/supabase-js";

export class ProjectRepository {
  private supabase: SupabaseClient<Database>;

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase;
  }

  /**
   * Pobiera projekty użytkownika wraz z liczbą członków
   * @param userId ID użytkownika
   * @returns Lista projektów z liczbą członków
   */
  async getUserProjects(userId: string): Promise<{
    data: (Project & { members_count: { count: number }[] })[] | null;
    error: any;
  }> {
    return await this.supabase
      .from("projects")
      .select(
        `
        *,
        projects_users!inner(user_id),
        members_count:projects_users(count)
      `
      )
      .eq("projects_users.user_id", userId);
  }

  /**
   * Pobiera ostatnie utwory dla projektu
   * @param projectId ID projektu
   * @param limit Maksymalna liczba utworów do pobrania
   * @returns Lista utworów
   */
  async getRecentTracks(
    projectId: number,
    limit: number = 3
  ): Promise<{
    data: Track[] | null;
    error: any;
  }> {
    return await this.supabase
      .from("tracks")
      .select()
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(limit);
  }

  /**
   * Pobiera członków projektu
   * @param projectId ID projektu
   * @param limit Maksymalna liczba członków do pobrania
   * @returns Lista członków projektu
   */
  async getProjectMembers(
    projectId: number,
    limit: number = 5
  ): Promise<{
    data: { user: User }[] | null;
    error: any;
  }> {
    return await this.supabase
      .from("projects_users")
      .select(
        `
        user:user_id(*)
      `
      )
      .eq("project_id", projectId)
      .limit(limit);
  }

  /**
   * Tworzy nowy projekt
   * @param name Nazwa projektu
   * @returns Utworzony projekt
   */
  async createProject(name: string): Promise<{
    data: Project | null;
    error: any;
  }> {
    return await this.supabase
      .from("projects")
      .insert([{ name: name.trim() }])
      .select("*")
      .single();
  }
}
