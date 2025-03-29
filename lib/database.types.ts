export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          group_count: number
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          group_count?: number
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          group_count?: number
        }
        Relationships: []
      }
      groups: {
        Row: {
          id: string
          name: string
          url: string
          description: string
          category_id: string | null
          size: number | null
          activity_level: string | null
          screenshot_url: string | null
          submitted_by: string
          submitted_at: string
          last_verified: string | null
          upvotes: number
          downvotes: number
          average_rating: number
          view_count: number
          is_private: boolean
          is_verified: boolean
          status: string
          search_vector: unknown | null
        }
        Insert: {
          id?: string
          name: string
          url: string
          description: string
          category_id?: string | null
          size?: number | null
          activity_level?: string | null
          screenshot_url?: string | null
          submitted_by: string
          submitted_at?: string
          last_verified?: string | null
          upvotes?: number
          downvotes?: number
          average_rating?: number
          view_count?: number
          is_private?: boolean
          is_verified?: boolean
          status?: string
          search_vector?: unknown | null
        }
        Update: {
          id?: string
          name?: string
          url?: string
          description?: string
          category_id?: string | null
          size?: number | null
          activity_level?: string | null
          screenshot_url?: string | null
          submitted_by?: string
          submitted_at?: string
          last_verified?: string | null
          upvotes?: number
          downvotes?: number
          average_rating?: number
          view_count?: number
          is_private?: boolean
          is_verified?: boolean
          status?: string
          search_vector?: unknown | null
        }
        Relationships: [
          {
            foreignKeyName: "groups_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_submitted_by_fkey"
            columns: ["submitted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      groups_tags: {
        Row: {
          group_id: string
          tag_id: string
        }
        Insert: {
          group_id: string
          tag_id: string
        }
        Update: {
          group_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_tags_group_id_fkey"
            columns: ["group_id"]
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_tags_tag_id_fkey"
            columns: ["tag_id"]
            referencedRelation: "tags"
            referencedColumns: ["id"]
          }
        ]
      }
      reviews: {
        Row: {
          id: string
          group_id: string
          user_id: string
          rating: number
          comment: string | null
          created_at: string
          updated_at: string | null
          helpful_votes: number
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string | null
          helpful_votes?: number
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string | null
          helpful_votes?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_group_id_fkey"
            columns: ["group_id"]
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      tags: {
        Row: {
          id: string
          name: string
          group_count: number
        }
        Insert: {
          id?: string
          name: string
          group_count?: number
        }
        Update: {
          id?: string
          name?: string
          group_count?: number
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          email: string
          display_name: string
          avatar_url: string | null
          created_at: string
          last_login: string | null
          reputation: number
          auth_id: string | null
        }
        Insert: {
          id?: string
          email: string
          display_name: string
          avatar_url?: string | null
          created_at?: string
          last_login?: string | null
          reputation?: number
          auth_id?: string | null
        }
        Update: {
          id?: string
          email?: string
          display_name?: string
          avatar_url?: string | null
          created_at?: string
          last_login?: string | null
          reputation?: number
          auth_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_auth_id_fkey"
            columns: ["auth_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      votes: {
        Row: {
          user_id: string
          group_id: string
          vote_type: string
          created_at: string
        }
        Insert: {
          user_id: string
          group_id: string
          vote_type: string
          created_at?: string
        }
        Update: {
          user_id?: string
          group_id?: string
          vote_type?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_group_id_fkey"
            columns: ["group_id"]
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 