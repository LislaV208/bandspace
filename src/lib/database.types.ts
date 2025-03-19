export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      project_invites: {
        Row: {
          created_at: string
          expires_at: string
          id: number
          project_id: number
          token: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: number
          project_id: number
          token: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: number
          project_id?: number
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_invites_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          id: number
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string
          slug?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects_users: {
        Row: {
          id: number
          project_id: number
          user_id: string
        }
        Insert: {
          id?: number
          project_id: number
          user_id: string
        }
        Update: {
          id?: number
          project_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_users_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_users_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      track_categories: {
        Row: {
          id: number
          name: string
          parent_id: number | null
          slug: string
        }
        Insert: {
          id?: number
          name: string
          parent_id?: number | null
          slug: string
        }
        Update: {
          id?: number
          name?: string
          parent_id?: number | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "track_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "track_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      track_comments: {
        Row: {
          content: string
          created_at: string
          id: number
          track_id: number
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          track_id: number
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          track_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "track_comments_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      track_files: {
        Row: {
          category_id: number
          created_at: string
          description: string | null
          duration: number | null
          file_extension: string
          file_name: string
          file_size: number
          file_url: string
          id: number
          is_primary: boolean
          track_id: number
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          category_id: number
          created_at?: string
          description?: string | null
          duration?: number | null
          file_extension: string
          file_name: string
          file_size: number
          file_url: string
          id?: number
          is_primary?: boolean
          track_id: number
          updated_at?: string
          uploaded_by?: string
        }
        Update: {
          category_id?: number
          created_at?: string
          description?: string | null
          duration?: number | null
          file_extension?: string
          file_name?: string
          file_size?: number
          file_url?: string
          id?: number
          is_primary?: boolean
          track_id?: number
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "track_files_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "track_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_files_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tracks: {
        Row: {
          created_at: string
          file_name: string
          id: number
          name: string
          project_id: number
          slug: string
          storage_file_path: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          id?: number
          name?: string
          project_id: number
          slug?: string
          storage_file_path?: string
          uploaded_by?: string
        }
        Update: {
          created_at?: string
          file_name?: string
          id?: number
          name?: string
          project_id?: number
          slug?: string
          storage_file_path?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracks_uploaded_by_fkey1"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_unique_slug: {
        Args: {
          table_name: string
          base_name: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
