import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { applyApiSecurity, createInternalServerErrorResponse, createUnauthorizedResponse } from '@/lib/security';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

/**
 * Get featured listings
 */
export async function GET(request: NextRequest) {
  try {
    // Apply security checks
    const securityResponse = await applyApiSecurity(request, {
      rateLimit: 100,
      checkSqlInjection: true
    });
    
    if (securityResponse) return securityResponse;

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const categoryId = searchParams.get('categoryId');
    
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    
    let query = supabase
      .from('featured_listings')
      .select(`
        id,
        group_id,
        promotion_type,
        start_date,
        end_date,
        status,
        groups:group_id (
          id,
          name,
          description,
          url,
          screenshot_url,
          category_id,
          upvotes,
          downvotes,
          average_rating,
          categories:category_id (
            id,
            name
          )
        )
      `)
      .eq('status', 'active')
      .lte('start_date', new Date().toISOString())
      .gte('end_date', new Date().toISOString());
    
    if (groupId) {
      query = query.eq('group_id', groupId);
    }
    
    if (categoryId) {
      query = query.eq('groups.category_id', categoryId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching featured listings:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch featured listings' 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      data 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return createInternalServerErrorResponse();
  }
}

/**
 * Create a new featured listing
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
    const supabase = createServerClient(cookieStore);
    
    // Get user from session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return createUnauthorizedResponse();
    }
    
    const body = await request.json();
    const { group_id, promotion_type, duration_days } = body;
    
    if (!group_id || !promotion_type || !duration_days) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: group_id, promotion_type, and duration_days' 
      }, { status: 400 });
    }
    
    // Verify group ownership
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('id', group_id)
      .single();
      
    if (groupError || !group) {
      return NextResponse.json({ 
        success: false, 
        error: 'Group not found' 
      }, { status: 404 });
    }
    
    if (group.submitted_by !== session.user.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Not authorized to promote this group' 
      }, { status: 403 });
    }
    
    // Calculate pricing based on promotion type and duration
    let amount = 0;
    let validPromotion = true;
    
    switch (promotion_type) {
      case 'featured':
        amount = 15.00 * (duration_days / 7);
        break;
      case 'category_spotlight':
        amount = 12.00 * (duration_days / 7);
        break;
      case 'enhanced_listing':
        amount = 19.99 * (duration_days / 30);
        break;
      case 'bundle':
        amount = 29.99 * (duration_days / 7);
        break;
      default:
        validPromotion = false;
    }
    
    if (!validPromotion) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid promotion type' 
      }, { status: 400 });
    }
    
    // Ensure minimum amount
    amount = Math.max(amount, 1.00);
    
    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration_days);
    
    try {
      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // convert to cents
        currency: 'usd',
        metadata: {
          group_id,
          user_id: session.user.id,
          promotion_type,
          duration_days,
        },
      });
      
      // Store pending promotion
      const { error: insertError } = await supabase.from('featured_listings').insert({
        group_id,
        user_id: session.user.id,
        promotion_type,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'pending', // Will be updated to 'active' once payment is complete
        amount_paid: amount,
      });
      
      if (insertError) {
        console.error('Error inserting featured listing:', insertError);
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to create featured listing' 
        }, { status: 500 });
      }
      
      // Add record to payment history
      await supabase.from('payment_history').insert({
        user_id: session.user.id,
        amount,
        currency: 'usd',
        payment_method: 'card',
        status: 'pending',
        type: 'promotion',
        reference_id: paymentIntent.id,
      });
      
      return NextResponse.json({
        success: true,
        data: {
          clientSecret: paymentIntent.client_secret,
          amount,
        }
      });
    } catch (stripeError: any) {
      console.error('Error creating Stripe payment intent:', stripeError);
      return NextResponse.json({ 
        success: false, 
        error: `Stripe error: ${stripeError.message}` 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return createInternalServerErrorResponse();
  }
} 