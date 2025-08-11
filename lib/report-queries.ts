import { createServerClient } from './supabase';
import { cookies } from 'next/headers';
import { Database } from './database.types';

interface ReportFilters {
  status?: 'pending' | 'in_review' | 'resolved' | 'dismissed';
  limit?: number;
  offset?: number;
}

/**
 * Get all reports with pagination and filtering
 */
export async function getReports({
  status,
  limit = 10,
  offset = 0,
}: ReportFilters = {}) {
  const supabase = await createServerClient();

  // Build the query
  let query = supabase
    .from('reports')
    .select(`
      *,
      groups(id, name, screenshot_url),
      users:user_id(id, display_name, avatar_url),
      admin:resolved_by(id, display_name)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Add status filter if provided
  if (status) {
    query = query.eq('status', status);
  }

  // Execute the query
  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching reports:', error);
    throw new Error('Failed to fetch reports');
  }

  return { 
    reports: data || [], 
    count 
  };
}

/**
 * Get report counts by status
 */
export async function getReportCounts() {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('report_counts')
    .select('*');

  if (error) {
    console.error('Error fetching report counts:', error);
    throw new Error('Failed to fetch report counts');
  }

  // Transform the data into a more usable format
  const counts = {
    pending: 0,
    in_review: 0,
    resolved: 0,
    dismissed: 0,
    total: 0
  };

  data.forEach((item: any) => {
    if (item.status === 'pending') counts.pending = item.count;
    if (item.status === 'in_review') counts.in_review = item.count;
    if (item.status === 'resolved') counts.resolved = item.count;
    if (item.status === 'dismissed') counts.dismissed = item.count;
    counts.total += item.count;
  });

  return counts;
}

/**
 * Check if user is an admin
 */
export async function isAdmin() {
  const supabase = await createServerClient();

  // Get user session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;

  // Check if user is an admin
  const { data: userData, error } = await supabase
    .from('users')
    .select('email, role')
    .eq('auth_id', session.user.id)
    .single();

  if (error || !userData) return false;

  // Check if admin based on role or email domain
  return userData.role === 'admin' || userData.email?.endsWith('@example.com');
} 