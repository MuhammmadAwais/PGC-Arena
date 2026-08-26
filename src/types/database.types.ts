export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      campuses: {
        Row: {
          banner_url: string | null
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          region: string | null
        }
        Insert: {
          banner_url?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          region?: string | null
        }
        Update: {
          banner_url?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          region?: string | null
        }
        Relationships: []
      }
      match_answers: {
        Row: {
          answered_by: string
          created_at: string | null
          id: string
          is_correct: boolean
          match_id: string
          question_id: string
          team_id: string
        }
        Insert: {
          answered_by: string
          created_at?: string | null
          id?: string
          is_correct: boolean
          match_id: string
          question_id: string
          team_id: string
        }
        Update: {
          answered_by?: string
          created_at?: string | null
          id?: string
          is_correct?: boolean
          match_id?: string
          question_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_answers_answered_by_fkey"
            columns: ["answered_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_answers_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_answers_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          campus_id: string
          created_at: string | null
          id: string
          status: Database["public"]["Enums"]["match_status"] | null
          teacher_id: string
        }
        Insert: {
          campus_id: string
          created_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["match_status"] | null
          teacher_id: string
        }
        Update: {
          campus_id?: string
          created_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["match_status"] | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          banner_url: string | null
          campus_id: string
          created_at: string | null
          elo_rating: number | null
          id: string
          leader_id: string | null
          logo_url: string | null
          name: string
        }
        Insert: {
          banner_url?: string | null
          campus_id: string
          created_at?: string | null
          elo_rating?: number | null
          id?: string
          leader_id?: string | null
          logo_url?: string | null
          name: string
        }
        Update: {
          banner_url?: string | null
          campus_id?: string
          created_at?: string | null
          elo_rating?: number | null
          id?: string
          leader_id?: string | null
          logo_url?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          campus_id: string | null
          full_name: string
          id: string
          ign: string | null
          is_first_login: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          roll_number: string
          team_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          campus_id?: string | null
          full_name: string
          id: string
          ign?: string | null
          is_first_login?: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          roll_number: string
          team_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          campus_id?: string | null
          full_name?: string
          id?: string
          ign?: string | null
          is_first_login?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          roll_number?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      match_status: "WAITING" | "ACTIVE" | "FINISHED"
      user_role: "SUPER_ADMIN" | "CAMPUS_MANAGER" | "TEACHER" | "STUDENT"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      match_status: ["WAITING", "ACTIVE", "FINISHED"],
      user_role: ["SUPER_ADMIN", "CAMPUS_MANAGER", "TEACHER", "STUDENT"],
    },
  },
} as const
