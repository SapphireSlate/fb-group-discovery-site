import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const searchParams = request.nextUrl.searchParams;
    const withGroupCount = searchParams.get('with_group_count') === 'true';
    const sort = searchParams.get('sort') || 'name';
    const order = searchParams.get('order') || 'asc';
    
    let query = supabase
      .from('categories')
      .select('*');
    
    // Apply sorting
    if (sort === 'name') {
      query = query.order('name', { ascending: order === 'asc' });
    } else if (sort === 'group_count' && withGroupCount) {
      query = query.order('group_count', { ascending: order === 'asc' });
    }
    
    const { data: categories, error } = await query;
    
    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
    
    // If requested, calculate group count for each category
    if (withGroupCount) {
      // Get counts manually since we can't use group() directly in this context
      const categoryIds = categories.map(category => category.id);
      
      // Get count of groups for each category
      for (const category of categories) {
        const { count, error: countError } = await supabase
          .from('groups')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id)
          .eq('status', 'active');
          
        if (!countError) {
          category.group_count = count || 0;
        } else {
          category.group_count = 0;
        }
      }
      
      // Re-sort by group_count if needed
      if (sort === 'group_count') {
        categories.sort((a, b) => {
          return order === 'asc' 
            ? (a.group_count || 0) - (b.group_count || 0)
            : (b.group_count || 0) - (a.group_count || 0);
        });
      }
    }
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    // Check if user is authenticated and is an admin
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has admin permissions (example check)
    const isAdmin = session.user.email === 'admin@example.com'; // Replace with actual admin check
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    
    const body = await request.json();
    const { name, description, icon } = body;
    
    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }
    
    // Check if category already exists
    const { data: existingCategory, error: checkError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', name)
      .maybeSingle();
    
    if (existingCategory) {
      return NextResponse.json({ error: 'Category with this name already exists' }, { status: 409 });
    }
    
    // Insert the new category
    const { data: category, error } = await supabase
      .from('categories')
      .insert({
        name,
        description: description || '',
        icon: icon || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating category:', error);
      return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: 'Category created successfully',
      category 
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 