// ──────────────────────────────────────────────
// Supabase Database Types
// ──────────────────────────────────────────────
// To generate types from your Supabase project, run:
//   npx supabase gen types typescript --project-id <project-id> > lib/supabase/database.types.ts
//
// The hand-written types below keep the code compiling before generation.

export type ItemStatus = "planned" | "active" | "waiting" | "done";

export type EventType =
  | "item_created"
  | "item_updated"
  | "status_changed"
  | "comment_added"
  | "item_deleted";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          surname: string;
          avatar_url: string | null;
          role: "admin" | "family";
          created_at: string;
        };
        Insert: {
          id: string;
          name?: string;
          surname?: string;
          avatar_url?: string | null;
          role?: "admin" | "family";
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          surname?: string;
          avatar_url?: string | null;
          role?: "admin" | "family";
          created_at?: string;
        };
        Relationships: [];
      };
      invites: {
        Row: {
          id: string;
          email: string;
          token: string;
          invited_by: string;
          accepted_at: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          token?: string;
          invited_by: string;
          accepted_at?: string | null;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          token?: string;
          invited_by?: string;
          accepted_at?: string | null;
          expires_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invites_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      roadmap_items: {
        Row: {
          id: string;
          title: string;
          description: string;
          start_date: string | null;
          end_date: string | null;
          status: ItemStatus;
          tags: string[];
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          start_date?: string | null;
          end_date?: string | null;
          status?: ItemStatus;
          tags?: string[];
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          start_date?: string | null;
          end_date?: string | null;
          status?: ItemStatus;
          tags?: string[];
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "roadmap_items_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      comments: {
        Row: {
          id: string;
          item_id: string;
          user_id: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          user_id: string;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          item_id?: string;
          user_id?: string;
          message?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "roadmap_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      events: {
        Row: {
          id: string;
          type: EventType;
          actor_id: string;
          item_id: string | null;
          payload: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: EventType;
          actor_id: string;
          item_id?: string | null;
          payload?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: EventType;
          actor_id?: string;
          item_id?: string | null;
          payload?: Record<string, unknown>;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "roadmap_items";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: { uid: string };
        Returns: boolean;
      };
      validate_invite: {
        Args: { invite_token: string };
        Returns: { email: string; valid: boolean }[];
      };
      accept_invite: {
        Args: { invite_token: string };
        Returns: void;
      };
    };
    Enums: {
      item_status: ItemStatus;
      event_type: EventType;
    };
  };
}
