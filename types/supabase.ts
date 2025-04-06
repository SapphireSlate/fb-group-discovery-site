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
      plans: {
        Row: {
          id: string
          name: string
          description: string | null
          price_monthly: number
          price_yearly: number | null
          features: Json | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          description?: string | null
          price_monthly: number
          price_yearly?: number | null
          features?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price_monthly?: number
          price_yearly?: number | null
          features?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: string
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          payment_method: string | null
          payment_processor: string | null
          payment_processor_subscription_id: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          payment_method?: string | null
          payment_processor?: string | null
          payment_processor_subscription_id?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          payment_method?: string | null
          payment_processor?: string | null
          payment_processor_subscription_id?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      payment_history: {
        Row: {
          id: string
          user_id: string
          subscription_id: string | null
          amount: number
          currency: string
          status: string
          payment_method: string | null
          payment_processor: string | null
          payment_processor_payment_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id?: string | null
          amount: number
          currency?: string
          status: string
          payment_method?: string | null
          payment_processor?: string | null
          payment_processor_payment_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string | null
          amount?: number
          currency?: string
          status?: string
          payment_method?: string | null
          payment_processor?: string | null
          payment_processor_payment_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      promotions: {
        Row: {
          id: string
          user_id: string
          group_id: string
          package: string
          status: string
          start_date: string
          end_date: string
          custom_message: string | null
          target_audience: string | null
          views_count: number
          clicks_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          group_id: string
          package: string
          status: string
          start_date?: string
          end_date: string
          custom_message?: string | null
          target_audience?: string | null
          views_count?: number
          clicks_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          group_id?: string
          package?: string
          status?: string
          start_date?: string
          end_date?: string
          custom_message?: string | null
          target_audience?: string | null
          views_count?: number
          clicks_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: string
          has_subscription: boolean
          last_payment_date: string | null
          plan_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: string
          has_subscription?: boolean
          last_payment_date?: string | null
          plan_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: string
          has_subscription?: boolean
          last_payment_date?: string | null
          plan_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      groups: {
        Row: {
          id: string
          name: string
          description: string | null
          url: string
          category_id: string
          submitted_by: string
          submitted_at: string
          status: string
          is_promoted: boolean
          promotion_type: string | null
          promotion_ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          url: string
          category_id: string
          submitted_by: string
          submitted_at?: string
          status?: string
          is_promoted?: boolean
          promotion_type?: string | null
          promotion_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          url?: string
          category_id?: string
          submitted_by?: string
          submitted_at?: string
          status?: string
          is_promoted?: boolean
          promotion_type?: string | null
          promotion_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      active_subscriptions: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string | null
          plan_id: string
          plan_name: string
          price_monthly: number
          current_period_end: string | null
          subscription_start_date: string
          updated_at: string
        }
      }
    }
    Functions: {
      has_active_subscription: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      get_user_plan: {
        Args: { user_uuid: string }
        Returns: string
      }
      update_expired_promotions: {
        Args: Record<string, unknown>
        Returns: unknown
      }
    }
  }
}
