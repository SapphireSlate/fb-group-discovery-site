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
      badges: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          level: number
          points: number
          category: string
          created_at: string
          requirements: string | null
          display_order: number
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon: string
          level?: number
          points?: number
          category: string
          created_at?: string
          requirements?: string | null
          display_order?: number
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          level?: number
          points?: number
          category?: string
          created_at?: string
          requirements?: string | null
          display_order?: number
        }
        Relationships: []
      }
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
      email_preferences: {
        Row: {
          id: string
          user_id: string
          welcome_email: boolean
          group_approved: boolean
          new_review: boolean
          reputation_milestone: boolean
          new_badge: boolean
          new_report: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          welcome_email?: boolean
          group_approved?: boolean
          new_review?: boolean
          reputation_milestone?: boolean
          new_badge?: boolean
          new_report?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          welcome_email?: boolean
          group_approved?: boolean
          new_review?: boolean
          reputation_milestone?: boolean
          new_badge?: boolean
          new_report?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_preferences_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
          verification_date: string | null
          verified_by: string | null
          verification_notes: string | null
          verification_status: string
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
          verification_date?: string | null
          verified_by?: string | null
          verification_notes?: string | null
          verification_status?: string
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
          verification_date?: string | null
          verified_by?: string | null
          verification_notes?: string | null
          verification_status?: string
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
          },
          {
            foreignKeyName: "groups_verified_by_fkey"
            columns: ["verified_by"]
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
      reports: {
        Row: {
          id: string
          group_id: string
          user_id: string
          reason: string
          comment: string | null
          status: string
          created_at: string
          updated_at: string | null
          resolved_by: string | null
          resolved_at: string | null
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          reason: string
          comment?: string | null
          status?: string
          created_at?: string
          updated_at?: string | null
          resolved_by?: string | null
          resolved_at?: string | null
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          reason?: string
          comment?: string | null
          status?: string
          created_at?: string
          updated_at?: string | null
          resolved_by?: string | null
          resolved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_group_id_fkey"
            columns: ["group_id"]
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_resolved_by_fkey"
            columns: ["resolved_by"]
            referencedRelation: "users"
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
          role: string | null
          reputation_points: number
          reputation_level: number
          badges_count: number
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
          role?: string | null
          reputation_points?: number
          reputation_level?: number
          badges_count?: number
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
          role?: string | null
          reputation_points?: number
          reputation_level?: number
          badges_count?: number
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
      reputation_history: {
        Row: {
          id: string
          user_id: string
          points: number
          reason: string
          source_type: string
          source_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          points: number
          reason: string
          source_type: string
          source_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          points?: number
          reason?: string
          source_type?: string
          source_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reputation_history_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          awarded_at: string
          level: number
          times_awarded: number
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          awarded_at?: string
          level?: number
          times_awarded?: number
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          awarded_at?: string
          level?: number
          times_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            referencedRelation: "badges"
            referencedColumns: ["id"]
          }
        ]
      }
      verification_logs: {
        Row: {
          id: string
          group_id: string
          user_id: string
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          status: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          status?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_logs_group_id_fkey"
            columns: ["group_id"]
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_logs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      report_counts: {
        Row: {
          status: string
          count: number
        }
      },
      reputation_leaderboard: {
        Row: {
          id: string
          display_name: string
          avatar_url: string | null
          reputation_points: number
          reputation_level: number
          badges_count: number
          reviews_count: number
          groups_submitted_count: number
          rank: number
        }
      },
      verification_stats: {
        Row: {
          verification_status: string
          count: number
          last_verification_date: string | null
        }
      }
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