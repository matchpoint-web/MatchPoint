/**
 * Supabase Database types for the MatchPoint public schema.
 *
 * Generated from project migrations under supabase/migrations/
 * (remote `supabase gen types` requires SUPABASE_ACCESS_TOKEN / Docker).
 *
 * Regenerate when the remote schema is available:
 *   npm run db:types
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      coach_notes: {
        Row: {
          id: string;
          college_id: string;
          player_id: string;
          status: string;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          college_id: string;
          player_id: string;
          status: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          college_id?: string;
          player_id?: string;
          status?: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "coach_notes_college_id_fkey";
            columns: ["college_id"];
            isOneToOne: false;
            referencedRelation: "colleges";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "coach_notes_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
        ];
      };
      colleges: {
        Row: {
          id: string;
          user_id: string | null;
          school_name: string;
          division: string | null;
          location: string | null;
          conference: string | null;
          state: string | null;
          city: string | null;
          website: string | null;
          head_coach: string | null;
          assistant_coach: string | null;
          contact_email: string | null;
          about_program: string | null;
          facilities: string | null;
          recruiting_information: string | null;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          school_name: string;
          division?: string | null;
          location?: string | null;
          conference?: string | null;
          state?: string | null;
          city?: string | null;
          website?: string | null;
          head_coach?: string | null;
          assistant_coach?: string | null;
          contact_email?: string | null;
          about_program?: string | null;
          facilities?: string | null;
          recruiting_information?: string | null;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          school_name?: string;
          division?: string | null;
          location?: string | null;
          conference?: string | null;
          state?: string | null;
          city?: string | null;
          website?: string | null;
          head_coach?: string | null;
          assistant_coach?: string | null;
          contact_email?: string | null;
          about_program?: string | null;
          facilities?: string | null;
          recruiting_information?: string | null;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "colleges_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: {
          id: string;
          player_id: string;
          college_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          college_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          player_id?: string;
          college_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_college_id_fkey";
            columns: ["college_id"];
            isOneToOne: false;
            referencedRelation: "colleges";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_user_id: string;
          sender_role: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_user_id: string;
          sender_role: string;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_user_id?: string;
          sender_role?: string;
          message?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          metadata: Json | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          metadata?: Json | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          metadata?: Json | null;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      player_documents: {
        Row: {
          id: string;
          player_id: string;
          document_type: string;
          file_name: string | null;
          storage_path: string | null;
          public_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          document_type: string;
          file_name?: string | null;
          storage_path?: string | null;
          public_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          player_id?: string;
          document_type?: string;
          file_name?: string | null;
          storage_path?: string | null;
          public_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "player_documents_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
        ];
      };
      players: {
        Row: {
          id: string;
          user_id: string | null;
          full_name: string;
          nationality: string | null;
          graduation_year: number | null;
          utr: number | null;
          gpa: number | null;
          height: number | null;
          weight: number | null;
          dominant_hand: string | null;
          backhand: string | null;
          date_of_birth: string | null;
          bio: string | null;
          profile_image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          full_name: string;
          nationality?: string | null;
          graduation_year?: number | null;
          utr?: number | null;
          gpa?: number | null;
          height?: number | null;
          weight?: number | null;
          dominant_hand?: string | null;
          backhand?: string | null;
          date_of_birth?: string | null;
          bio?: string | null;
          profile_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          full_name?: string;
          nationality?: string | null;
          graduation_year?: number | null;
          utr?: number | null;
          gpa?: number | null;
          height?: number | null;
          weight?: number | null;
          dominant_hand?: string | null;
          backhand?: string | null;
          date_of_birth?: string | null;
          bio?: string | null;
          profile_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "players_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      recently_viewed_players: {
        Row: {
          id: string;
          college_id: string;
          player_id: string;
          viewed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          college_id: string;
          player_id: string;
          viewed_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          college_id?: string;
          player_id?: string;
          viewed_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recently_viewed_players_college_id_fkey";
            columns: ["college_id"];
            isOneToOne: false;
            referencedRelation: "colleges";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recently_viewed_players_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
        ];
      };
      saved_players: {
        Row: {
          id: string;
          college_id: string;
          player_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          college_id: string;
          player_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          college_id?: string;
          player_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_players_college_id_fkey";
            columns: ["college_id"];
            isOneToOne: false;
            referencedRelation: "colleges";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "saved_players_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_create_notification_for: {
        Args: {
          target_user_id: string;
          notification_type: string;
        };
        Returns: boolean;
      };
      create_notification: {
        Args: {
          target_user_id: string;
          notification_type: string;
          notification_title: string;
          notification_message: string;
          notification_metadata?: Json | null;
        };
        Returns: Database["public"]["Tables"]["notifications"]["Row"];
      };
      jwt_app_role: {
        Args: Record<string, never>;
        Returns: string;
      };
      is_player_account: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_college_account: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      player_participates_in_college_conversation: {
        Args: {
          target_college_id: string;
        };
        Returns: boolean;
      };
      ensure_player_profile: {
        Args: Record<string, never>;
        Returns: string;
      };
      ensure_college_profile: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

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
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;
