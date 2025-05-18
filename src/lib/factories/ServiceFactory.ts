import type { Database } from "$lib/database.types";
import { ProjectRepository } from "$lib/repositories/ProjectRepository";
import { ProjectService } from "$lib/services/ProjectService";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Fabryka serwisów aplikacji
 */
export class ServiceFactory {
  private static projectRepository: ProjectRepository | null = null;
  private static projectService: ProjectService | null = null;

  /**
   * Inicjalizuje fabrykę serwisów
   * @param supabase Klient Supabase
   */
  static initialize(supabase: SupabaseClient<Database>): void {
    // Inicjalizacja repozytoriów
    this.projectRepository = new ProjectRepository(supabase);

    // Inicjalizacja serwisów
    this.projectService = new ProjectService(this.projectRepository);
  }

  /**
   * Zwraca serwis projektów
   * @returns Serwis projektów
   */
  static getProjectService(): ProjectService {
    if (!this.projectService) {
      throw new Error(
        "ServiceFactory nie zostało zainicjalizowane. Wywołaj najpierw initialize()."
      );
    }
    return this.projectService;
  }
}
