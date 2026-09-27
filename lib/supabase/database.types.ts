// Hand-written database types mirroring supabase/migrations/0001_init.sql.
// Regenerate with the Supabase CLI (`supabase gen types typescript`) once the
// project exists; kept in sync manually for Phase 1.

export interface Database {
  public: {
    Tables: {
      skills: {
        Row: {
          id: string;
          component: string;
          label_en: string;
          label_zh: string;
        };
        Insert: Database["public"]["Tables"]["skills"]["Row"];
        Update: Partial<Database["public"]["Tables"]["skills"]["Row"]>;
        Relationships: [];
      };
      items: {
        Row: {
          id: string;
          skill_id: string;
          type: string;
          ladder_stage: number;
          difficulty: number;
          tags: string[];
          prompt: unknown; // jsonb
        };
        Insert: Database["public"]["Tables"]["items"]["Row"];
        Update: Partial<Database["public"]["Tables"]["items"]["Row"]>;
        Relationships: [];
      };
      attempts: {
        Row: {
          id: string;
          user_id: string;
          item_id: string;
          stage: number;
          correct: boolean;
          error_tags: string[];
          latency_ms: number | null;
          context: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          item_id: string;
          stage: number;
          correct: boolean;
          error_tags?: string[];
          latency_ms?: number | null;
          context: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["attempts"]["Insert"]>;
        Relationships: [];
      };
      review_state: {
        Row: {
          user_id: string;
          item_id: string;
          interval_index: number;
          next_review_at: string;
          mastery_count: number;
          mastered: boolean;
          updated_at: string;
        };
        Insert: {
          user_id?: string;
          item_id: string;
          interval_index: number;
          next_review_at: string;
          mastery_count: number;
          mastered: boolean;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["review_state"]["Insert"]>;
        Relationships: [];
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          mode: string;
          started_at: string;
          finished_at: string;
          item_ids: string[];
          score_correct: number;
          score_total: number;
        };
        Insert: {
          id?: string;
          user_id?: string;
          mode: string;
          started_at: string;
          finished_at: string;
          item_ids: string[];
          score_correct: number;
          score_total: number;
        };
        Update: Partial<Database["public"]["Tables"]["sessions"]["Insert"]>;
        Relationships: [];
      };
      receipts: {
        Row: {
          session_id: string;
          user_id: string;
          data: unknown; // jsonb Receipt
          created_at: string;
        };
        Insert: {
          session_id: string;
          user_id?: string;
          data: unknown;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["receipts"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
