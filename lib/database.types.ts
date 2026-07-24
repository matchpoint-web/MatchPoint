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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      coach_notes: {
        Row: {
          college_id: string
          created_at: string
          id: string
          notes: string
          player_id: string
          status: string
          updated_at: string
        }
        Insert: {
          college_id: string
          created_at?: string
          id?: string
          notes?: string
          player_id: string
          status: string
          updated_at?: string
        }
        Update: {
          college_id?: string
          created_at?: string
          id?: string
          notes?: string
          player_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_notes_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_notes_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      colleges: {
        Row: {
          about_program: string | null
          account_status: string
          assistant_coach: string | null
          city: string | null
          conference: string | null
          contact_email: string | null
          created_at: string
          division: string | null
          facilities: string | null
          head_coach: string | null
          id: string
          location: string | null
          logo_url: string | null
          recruiting_information: string | null
          school_name: string
          state: string | null
          suspended_at: string | null
          suspended_by: string | null
          suspended_reason:
            | Database["public"]["Enums"]["suspended_reason"]
            | null
          updated_at: string
          user_id: string | null
          website: string | null
        }
        Insert: {
          about_program?: string | null
          account_status?: string
          assistant_coach?: string | null
          city?: string | null
          conference?: string | null
          contact_email?: string | null
          created_at?: string
          division?: string | null
          facilities?: string | null
          head_coach?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          recruiting_information?: string | null
          school_name: string
          state?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspended_reason?:
            | Database["public"]["Enums"]["suspended_reason"]
            | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Update: {
          about_program?: string | null
          account_status?: string
          assistant_coach?: string | null
          city?: string | null
          conference?: string | null
          contact_email?: string | null
          created_at?: string
          division?: string | null
          facilities?: string | null
          head_coach?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          recruiting_information?: string | null
          school_name?: string
          state?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspended_reason?:
            | Database["public"]["Enums"]["suspended_reason"]
            | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          college_id: string
          created_at: string
          id: string
          player_id: string
          updated_at: string
        }
        Insert: {
          college_id: string
          created_at?: string
          id?: string
          player_id: string
          updated_at?: string
        }
        Update: {
          college_id?: string
          created_at?: string
          id?: string
          player_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          message: string
          sender_role: string
          sender_user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          message: string
          sender_role: string
          sender_user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          message?: string
          sender_role?: string
          sender_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      player_documents: {
        Row: {
          created_at: string
          document_type: string
          file_name: string | null
          id: string
          player_id: string
          public_url: string | null
          storage_path: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_type: string
          file_name?: string | null
          id?: string
          player_id: string
          public_url?: string | null
          storage_path?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_type?: string
          file_name?: string | null
          id?: string
          player_id?: string
          public_url?: string | null
          storage_path?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_documents_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          account_status: string
          backhand: string | null
          bio: string | null
          created_at: string
          date_of_birth: string | null
          dominant_hand: string | null
          duolingo: number | null
          full_name: string
          gpa: number | null
          graduation_year: number | null
          height: number | null
          high_school: string | null
          id: string
          ielts: number | null
          intended_major: string | null
          itf_ranking: string | null
          national_ranking: string | null
          nationality: string | null
          preferred_ncaa_division: string | null
          profile_image_url: string | null
          sat: number | null
          suspended_at: string | null
          suspended_by: string | null
          suspended_reason:
            | Database["public"]["Enums"]["suspended_reason"]
            | null
          toefl: number | null
          updated_at: string
          user_id: string | null
          usta_ranking: string | null
          utr: number | null
          weight: number | null
        }
        Insert: {
          account_status?: string
          backhand?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          dominant_hand?: string | null
          duolingo?: number | null
          full_name: string
          gpa?: number | null
          graduation_year?: number | null
          height?: number | null
          high_school?: string | null
          id?: string
          ielts?: number | null
          intended_major?: string | null
          itf_ranking?: string | null
          national_ranking?: string | null
          nationality?: string | null
          preferred_ncaa_division?: string | null
          profile_image_url?: string | null
          sat?: number | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspended_reason?:
            | Database["public"]["Enums"]["suspended_reason"]
            | null
          toefl?: number | null
          updated_at?: string
          user_id?: string | null
          usta_ranking?: string | null
          utr?: number | null
          weight?: number | null
        }
        Update: {
          account_status?: string
          backhand?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          dominant_hand?: string | null
          duolingo?: number | null
          full_name?: string
          gpa?: number | null
          graduation_year?: number | null
          height?: number | null
          high_school?: string | null
          id?: string
          ielts?: number | null
          intended_major?: string | null
          itf_ranking?: string | null
          national_ranking?: string | null
          nationality?: string | null
          preferred_ncaa_division?: string | null
          profile_image_url?: string | null
          sat?: number | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspended_reason?:
            | Database["public"]["Enums"]["suspended_reason"]
            | null
          toefl?: number | null
          updated_at?: string
          user_id?: string | null
          usta_ranking?: string | null
          utr?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      recently_viewed_players: {
        Row: {
          college_id: string
          created_at: string
          id: string
          player_id: string
          viewed_at: string
        }
        Insert: {
          college_id: string
          created_at?: string
          id?: string
          player_id: string
          viewed_at?: string
        }
        Update: {
          college_id?: string
          created_at?: string
          id?: string
          player_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recently_viewed_players_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recently_viewed_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_players: {
        Row: {
          college_id: string
          created_at: string
          id: string
          player_id: string
        }
        Insert: {
          college_id: string
          created_at?: string
          id?: string
          player_id: string
        }
        Update: {
          college_id?: string
          created_at?: string
          id?: string
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_players_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_colleges: {
        Row: {
          college_id: string
          created_at: string
          id: string
          player_id: string
        }
        Insert: {
          college_id: string
          created_at?: string
          id?: string
          player_id: string
        }
        Update: {
          college_id?: string
          created_at?: string
          id?: string
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_colleges_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_colleges_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_role_from_user_row: {
        Args: { app_meta: Json; user_meta: Json }
        Returns: string
      }
      can_create_notification_for: {
        Args: { notification_type: string; target_user_id: string }
        Returns: boolean
      }
      create_notification: {
        Args: {
          notification_message: string
          notification_metadata?: Json
          notification_title: string
          notification_type: string
          target_user_id: string
        }
        Returns: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "notifications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      current_player_id: { Args: never; Returns: string }
      ensure_college_profile: { Args: never; Returns: string }
      ensure_player_profile: { Args: never; Returns: string }
      is_active_player_account: { Args: never; Returns: boolean }
      is_admin_account: { Args: never; Returns: boolean }
      is_approved_college_account: { Args: never; Returns: boolean }
      is_college_account: { Args: never; Returns: boolean }
      is_conversation_participant: {
        Args: { target_conversation_id: string }
        Returns: boolean
      }
      is_player_account: { Args: never; Returns: boolean }
      jwt_app_role: { Args: never; Returns: string }
      player_participates_in_college_conversation: {
        Args: { target_college_id: string }
        Returns: boolean
      }
    }
    Enums: {
      suspended_reason:
        | "SPAM"
        | "FAKE_ACCOUNT"
        | "FAKE_UNIVERSITY"
        | "ABUSE"
        | "TERMS_VIOLATION"
        | "OTHER"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      suspended_reason: [
        "SPAM",
        "FAKE_ACCOUNT",
        "FAKE_UNIVERSITY",
        "ABUSE",
        "TERMS_VIOLATION",
        "OTHER",
      ],
    },
  },
} as const
