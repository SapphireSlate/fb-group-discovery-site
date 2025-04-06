'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'

interface UserSubscription {
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  current_period_end: string;
}

interface AuthState {
  user: User | null;
  subscription: UserSubscription | null;
  isLoading: boolean;
  isAdmin: boolean;
}

export function useAuth(): AuthState {
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<User | null>(null)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const fetchUserAndSubscription = async () => {
      try {
        setIsLoading(true)
        
        // Get current user
        const { data: { session }, error: userError } = await supabase.auth.getSession()
        
        if (userError) {
          throw userError
        }
        
        if (session?.user) {
          setUser(session.user)
          
          // Check if user is admin
          const { data: userData, error: roleError } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single()
            
          if (!roleError && userData) {
            setIsAdmin(userData.role === 'admin')
          }
          
          // Get subscription data
          const { data: subData, error: subError } = await supabase
            .from('subscriptions')
            .select('plan_id, status, current_period_end')
            .eq('user_id', session.user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
            
          if (!subError && subData) {
            setSubscription(subData)
          }
        }
      } catch (error) {
        console.error('Error fetching auth state:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserAndSubscription()

    // Set up auth listener
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user)
          fetchUserAndSubscription()
        } else {
          setUser(null)
          setSubscription(null)
          setIsAdmin(false)
        }
      }
    )

    return () => {
      authSubscription.unsubscribe()
    }
  }, [supabase])

  return { user, subscription, isLoading, isAdmin }
} 