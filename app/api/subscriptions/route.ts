import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { applyApiSecurity, createInternalServerErrorResponse, createUnauthorizedResponse } from '@/lib/security';
import { Database } from '@/types/supabase';

/**
 * Get user's current subscription
 */
export async function GET(request: NextRequest) {
  try {
    // Apply security checks
    const securityResponse = await applyApiSecurity(request, {
      rateLimit: 50,
      checkSqlInjection: true
    });
    
    if (securityResponse) return securityResponse;

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    // Get user from session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return createUnauthorizedResponse();
    }
    
    // Get user subscriptions
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        id,
        plan_id,
        status,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        payment_method,
        created_at,
        updated_at,
        plans:plan_id (
          id,
          name,
          description,
          price_monthly,
          features
        )
      `)
      .eq('user_id', session.user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching subscription:', error);
      return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: data || null 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return createInternalServerErrorResponse();
  }
}

/**
 * Create a new subscription
 */
export async function POST(request: NextRequest) {
  try {
    // Apply security checks
    const securityResponse = await applyApiSecurity(request, {
      rateLimit: 10,
      checkSqlInjection: true
    });
    
    if (securityResponse) return securityResponse;

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    // Get user from session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return createUnauthorizedResponse();
    }
    
    const body = await request.json();
    const { plan_id, payment_method } = body;
    
    if (!plan_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required field: plan_id' 
      }, { status: 400 });
    }
    
    // Check if plan exists
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', plan_id)
      .eq('is_active', true)
      .single();
      
    if (planError || !plan) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid or inactive plan selected' 
      }, { status: 400 });
    }
    
    // Check if user already has an active subscription
    const { data: existingSub, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('status', 'active')
      .maybeSingle();
    
    if (existingSub) {
      return NextResponse.json({ 
        success: false, 
        error: 'User already has an active subscription' 
      }, { status: 400 });
    }
    
    // For free plans, just create the subscription
    if (plan.price_monthly === 0) {
      const now = new Date();
      const end = new Date();
      end.setFullYear(end.getFullYear() + 10); // Free plans don't expire
      
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: session.user.id,
          plan_id,
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: end.toISOString(),
          payment_method: 'none',
        });
      
      if (insertError) {
        console.error('Error creating free subscription:', insertError);
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to create subscription' 
        }, { status: 500 });
      }
      
      // Update user record
      await supabase
        .from('users')
        .update({ 
          has_subscription: true,
          plan_id,
          updated_at: new Date().toISOString() 
        })
        .eq('id', session.user.id);
      
      return NextResponse.json({
        success: true,
        data: { 
          message: 'Free subscription activated successfully' 
        }
      });
    }
    
    // For paid plans, in a real app we would process the payment here
    // For this demo, we'll simulate a successful payment
    
    // Calculate period end date (30 days from now)
    const now = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 30);
    
    // Create subscription record
    const { data: subscription, error: insertError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: session.user.id,
        plan_id,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: end.toISOString(),
        payment_method: payment_method || 'card',
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating subscription:', insertError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create subscription' 
      }, { status: 500 });
    }
    
    // Create payment history record
    await supabase
      .from('payment_history')
      .insert({
        user_id: session.user.id,
        subscription_id: subscription.id,
        amount: plan.price_monthly,
        currency: 'USD',
        status: 'succeeded',
        payment_method: payment_method || 'card',
      });
    
    // Update user record
    await supabase
      .from('users')
      .update({ 
        has_subscription: true,
        plan_id,
        last_payment_date: now.toISOString(),
        updated_at: now.toISOString() 
      })
      .eq('id', session.user.id);
    
    return NextResponse.json({
      success: true,
      data: {
        subscription,
        message: 'Subscription created successfully'
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return createInternalServerErrorResponse();
  }
}

/**
 * Update subscription (cancel or change plan)
 */
export async function PATCH(request: NextRequest) {
  try {
    // Apply security checks
    const securityResponse = await applyApiSecurity(request, {
      rateLimit: 10,
      checkSqlInjection: true
    });
    
    if (securityResponse) return securityResponse;

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    // Get user from session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return createUnauthorizedResponse();
    }
    
    const body = await request.json();
    const { subscription_id, action, plan_id } = body;
    
    if (!subscription_id || !action) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: subscription_id and action' 
      }, { status: 400 });
    }
    
    // Verify subscription belongs to user
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscription_id)
      .eq('user_id', session.user.id)
      .single();
    
    if (subError || !subscription) {
      return NextResponse.json({ 
        success: false, 
        error: 'Subscription not found or not owned by user' 
      }, { status: 404 });
    }
    
    // Handle different actions
    switch (action) {
      case 'cancel':
        // Update subscription status
        const { error: cancelError } = await supabase
          .from('subscriptions')
          .update({ 
            status: 'canceled',
            cancel_at_period_end: true,
            updated_at: new Date().toISOString() 
          })
          .eq('id', subscription_id);
        
        if (cancelError) {
          console.error('Error canceling subscription:', cancelError);
          return NextResponse.json({ 
            success: false, 
            error: 'Failed to cancel subscription' 
          }, { status: 500 });
        }
        
        return NextResponse.json({
          success: true,
          data: { 
            message: 'Subscription canceled successfully. Access will remain until the end of the billing period.' 
          }
        });
      
      case 'change_plan':
        if (!plan_id) {
          return NextResponse.json({ 
            success: false, 
            error: 'Missing required field for plan change: plan_id' 
          }, { status: 400 });
        }
        
        // Check if plan exists
        const { data: plan, error: planError } = await supabase
          .from('plans')
          .select('*')
          .eq('id', plan_id)
          .eq('is_active', true)
          .single();
          
        if (planError || !plan) {
          return NextResponse.json({ 
            success: false, 
            error: 'Invalid or inactive plan selected' 
          }, { status: 400 });
        }
        
        // Cancel current subscription
        await supabase
          .from('subscriptions')
          .update({ 
            status: 'canceled',
            updated_at: new Date().toISOString() 
          })
          .eq('id', subscription_id);
        
        // Create new subscription with new plan
        const now = new Date();
        const end = new Date();
        end.setDate(end.getDate() + 30);
        
        const { data: newSubscription, error: insertError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: session.user.id,
            plan_id,
            status: 'active',
            current_period_start: now.toISOString(),
            current_period_end: end.toISOString(),
            payment_method: subscription.payment_method,
          })
          .select()
          .single();
        
        if (insertError) {
          console.error('Error creating new subscription:', insertError);
          return NextResponse.json({ 
            success: false, 
            error: 'Failed to change subscription plan' 
          }, { status: 500 });
        }
        
        // Create payment history record for new plan
        await supabase
          .from('payment_history')
          .insert({
            user_id: session.user.id,
            subscription_id: newSubscription.id,
            amount: plan.price_monthly,
            currency: 'USD',
            status: 'succeeded',
            payment_method: subscription.payment_method,
          });
        
        // Update user record
        await supabase
          .from('users')
          .update({ 
            plan_id,
            last_payment_date: now.toISOString(),
            updated_at: now.toISOString() 
          })
          .eq('id', session.user.id);
        
        return NextResponse.json({
          success: true,
          data: {
            subscription: newSubscription,
            message: 'Subscription plan changed successfully'
          }
        });
      
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action. Supported actions: cancel, change_plan' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return createInternalServerErrorResponse();
  }
}

/**
 * Delete subscription (immediate cancellation)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Apply security checks
    const securityResponse = await applyApiSecurity(request, {
      rateLimit: 5,
      checkSqlInjection: true
    });
    
    if (securityResponse) return securityResponse;

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    // Get user from session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return createUnauthorizedResponse();
    }
    
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('id');
    
    if (!subscriptionId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required parameter: id' 
      }, { status: 400 });
    }
    
    // Verify subscription belongs to user
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('user_id', session.user.id)
      .single();
    
    if (subError || !subscription) {
      return NextResponse.json({ 
        success: false, 
        error: 'Subscription not found or not owned by user' 
      }, { status: 404 });
    }
    
    // In a real application, we would typically call the payment processor to cancel the subscription immediately
    // For this demo, we'll just update the status in our database
    
    // Update subscription status
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ 
        status: 'canceled',
        updated_at: new Date().toISOString(),
        current_period_end: new Date().toISOString() // End immediately
      })
      .eq('id', subscriptionId);
    
    if (updateError) {
      console.error('Error deleting subscription:', updateError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to delete subscription' 
      }, { status: 500 });
    }
    
    // Update user record
    await supabase
      .from('users')
      .update({ 
        has_subscription: false,
        plan_id: 'basic',
        updated_at: new Date().toISOString() 
      })
      .eq('id', session.user.id);
    
    return NextResponse.json({
      success: true,
      data: { 
        message: 'Subscription deleted successfully' 
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return createInternalServerErrorResponse();
  }
} 