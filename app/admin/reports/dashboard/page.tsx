import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  ArrowLeft, 
  BarChart3, 
  CheckCircle, 
  Clock, 
  Flag, 
  PieChart, 
  UserRound, 
  XCircle 
} from 'lucide-react';
import ReportsChart from './reports-chart';
import ReasonsPieChart from './reasons-pie-chart';

export default async function ReportsDashboardPage() {
  // Check if user is authorized to access admin panel
  const user = await requireAuth();
  
  const cookieStore = cookies();
  const supabase = await createServerClient(cookieStore);
  
  // Get the user's profile to check admin status
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .single();
  
  // Check admin status
  const isAdmin = profile?.email?.endsWith('@example.com'); // Replace with your actual admin check
  
  if (!isAdmin) {
    redirect('/'); // Redirect non-admins
  }
  
  // Fetch report counts by status
  const { data: reportCounts, error: countsError } = await supabase
    .from('reports')
    .select('status')
    .then(({ data, error }) => {
      if (error) throw error;
      
      const counts = {
        pending: 0,
        in_review: 0,
        resolved: 0,
        dismissed: 0,
        total: data.length
      };
      
      data.forEach(report => {
        if (report.status in counts) {
          counts[report.status]++;
        }
      });
      
      return { data: counts, error: null };
    });
    
  if (countsError) {
    console.error('Error fetching report counts:', countsError);
  }
  
  // Fetch report counts by reason
  const { data: reasonCounts, error: reasonsError } = await supabase
    .from('reports')
    .select('reason, count(*)')
    .group('reason')
    .then(({ data, error }) => {
      if (error) throw error;
      return { data, error: null };
    });
    
  if (reasonsError) {
    console.error('Error fetching reason counts:', reasonsError);
  }
  
  // Fetch monthly report stats (last 6 months)
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  
  const { data: monthlyStats, error: monthlyError } = await supabase
    .from('reports')
    .select('created_at, status')
    .gte('created_at', sixMonthsAgo.toISOString())
    .then(({ data, error }) => {
      if (error) throw error;
      
      // Process data into monthly counts
      const months = [];
      for (let i = 0; i < 6; i++) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.unshift(month);
      }
      
      const monthlyData = months.map(month => {
        const monthName = month.toLocaleDateString('en-US', { month: 'short' });
        const year = month.getFullYear();
        const monthStr = `${monthName} ${year}`;
        
        // Filter reports for this month
        const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
        const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        
        const reportsThisMonth = data.filter(report => {
          const reportDate = new Date(report.created_at);
          return reportDate >= startOfMonth && reportDate <= endOfMonth;
        });
        
        // Count by status
        const pending = reportsThisMonth.filter(r => r.status === 'pending').length;
        const in_review = reportsThisMonth.filter(r => r.status === 'in_review').length;
        const resolved = reportsThisMonth.filter(r => r.status === 'resolved').length;
        const dismissed = reportsThisMonth.filter(r => r.status === 'dismissed').length;
        
        return {
          month: monthStr,
          total: reportsThisMonth.length,
          pending,
          in_review,
          resolved,
          dismissed
        };
      });
      
      return { data: monthlyData, error: null };
    });
    
  if (monthlyError) {
    console.error('Error fetching monthly report stats:', monthlyError);
  }
  
  // Fetch top reporters
  const { data: topReporters, error: reportersError } = await supabase
    .from('reports')
    .select('reported_by, users:reported_by(display_name, avatar_url)')
    .then(({ data, error }) => {
      if (error) throw error;
      
      // Count reports by user
      const userCounts = {};
      data.forEach(report => {
        if (report.reported_by) {
          userCounts[report.reported_by] = (userCounts[report.reported_by] || 0) + 1;
        }
      });
      
      // Convert to array and sort
      const topUsers = Object.entries(userCounts)
        .map(([userId, count]) => {
          const userInfo = data.find(r => r.reported_by === userId)?.users;
          return {
            id: userId,
            count,
            displayName: userInfo?.display_name || 'Unknown User',
            avatarUrl: userInfo?.avatar_url
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      return { data: topUsers, error: null };
    });
    
  if (reportersError) {
    console.error('Error fetching top reporters:', reportersError);
  }
  
  // Format the reasonCounts data for the pie chart
  const reasonsData = reasonCounts?.map(item => ({
    name: item.reason,
    value: parseInt(item.count)
  })) || [];

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/reports">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Reports
            </Button>
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold">Reports Analytics Dashboard</h1>
        
        <div className="flex gap-2">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              Admin Home
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{reportCounts?.pending || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">In Review</p>
                <p className="text-2xl font-bold">{reportCounts?.in_review || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold">{reportCounts?.resolved || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Dismissed</p>
                <p className="text-2xl font-bold">{reportCounts?.dismissed || 0}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Monthly Trend */}
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Monthly Report Trends</CardTitle>
              <CardDescription>
                Number of reports submitted and their resolution status by month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportsChart data={monthlyStats || []} />
            </CardContent>
          </Card>
        </div>
        
        {/* Report Reasons */}
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Report Reasons</CardTitle>
              <CardDescription>
                Distribution of reports by reason
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReasonsPieChart data={reasonsData} />
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Reporters */}
        <Card>
          <CardHeader>
            <CardTitle>Top Reporters</CardTitle>
            <CardDescription>
              Users who have submitted the most reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topReporters && topReporters.length > 0 ? (
              <div className="space-y-4">
                {topReporters.map((reporter) => (
                  <div key={reporter.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        {reporter.avatarUrl ? (
                          <img 
                            src={reporter.avatarUrl} 
                            alt={reporter.displayName}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <UserRound className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <Link href={`/admin/users/${reporter.id}`}>
                          <p className="font-medium hover:underline">{reporter.displayName}</p>
                        </Link>
                        <p className="text-xs text-muted-foreground">User ID: {reporter.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{reporter.count} reports</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <UserRound className="mx-auto h-12 w-12 mb-4 opacity-20" />
                <p>No report data available</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Resolution Efficiency</CardTitle>
            <CardDescription>
              Average time to resolve reports and resolution rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Resolution Rate</h3>
                <div className="w-full bg-muted rounded-full h-4">
                  {reportCounts && reportCounts.total > 0 ? (
                    <div 
                      className="bg-green-500 h-4 rounded-full"
                      style={{ 
                        width: `${Math.round((reportCounts.resolved / reportCounts.total) * 100)}%` 
                      }}
                    ></div>
                  ) : (
                    <div className="bg-muted h-4 rounded-full"></div>
                  )}
                </div>
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>
                    {reportCounts && reportCounts.total > 0
                      ? `${Math.round((reportCounts.resolved / reportCounts.total) * 100)}%`
                      : '0%'
                    }
                  </span>
                  <span>100%</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Dismissal Rate</h3>
                <div className="w-full bg-muted rounded-full h-4">
                  {reportCounts && reportCounts.total > 0 ? (
                    <div 
                      className="bg-red-500 h-4 rounded-full"
                      style={{ 
                        width: `${Math.round((reportCounts.dismissed / reportCounts.total) * 100)}%` 
                      }}
                    ></div>
                  ) : (
                    <div className="bg-muted h-4 rounded-full"></div>
                  )}
                </div>
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>
                    {reportCounts && reportCounts.total > 0
                      ? `${Math.round((reportCounts.dismissed / reportCounts.total) * 100)}%`
                      : '0%'
                    }
                  </span>
                  <span>100%</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-muted/20 p-4 rounded-lg text-center">
                  <p className="text-lg font-bold text-green-500">
                    {reportCounts ? Math.round((reportCounts.resolved / Math.max(reportCounts.total, 1)) * 100) : 0}%
                  </p>
                  <p className="text-xs text-muted-foreground">Resolution Rate</p>
                </div>
                <div className="bg-muted/20 p-4 rounded-lg text-center">
                  <p className="text-lg font-bold text-blue-500">
                    {reportCounts ? reportCounts.in_review : 0}
                  </p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 