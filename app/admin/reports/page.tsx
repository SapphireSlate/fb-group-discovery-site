import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getReports, getReportCounts } from '@/lib/report-queries';
import { requireAdmin } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, Flag, XCircle } from 'lucide-react';
import ReportActionButtons from './report-action-buttons';

interface PageProps {
  searchParams: Promise<{
    status?: string;
    page?: string;
  }>;
}

export default async function ReportsPage({ searchParams }: PageProps) {
  // Require admin access
  await requireAdmin();

  // Process query parameters
  const params = await searchParams;
  const status = params.status as 'pending' | 'in_review' | 'resolved' | 'dismissed' | undefined;
  const page = parseInt(params.page || '1', 10);
  const limit = 10;
  const offset = (page - 1) * limit;

  // Fetch report counts
  const reportCounts = await getReportCounts();

  // Fetch reports with pagination and filtering
  const { reports, count } = await getReports({
    status,
    limit,
    offset,
  });

  // Calculate pagination values
  const totalPages = Math.ceil((count || 0) / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'in_review':
        return <Badge variant="outline" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> In Review</Badge>;
      case 'resolved':
        return <Badge variant="default" className="flex items-center gap-1 bg-green-500"><CheckCircle className="h-3 w-3" /> Resolved</Badge>;
      case 'dismissed':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Dismissed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Report Management</h1>
        <Link href="/admin">
          <Button variant="outline">Back to Admin</Button>
        </Link>
      </div>

      {/* Report Counts */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{reportCounts.pending}</p>
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
                <p className="text-2xl font-bold">{reportCounts.in_review}</p>
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
                <p className="text-2xl font-bold">{reportCounts.resolved}</p>
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
                <p className="text-2xl font-bold">{reportCounts.dismissed}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Filter Tabs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Reports</CardTitle>
          <CardDescription>View reports by status</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={status || 'all'} className="w-full">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="all" asChild>
                <Link href="/admin/reports">All ({reportCounts.total})</Link>
              </TabsTrigger>
              <TabsTrigger value="pending" asChild>
                <Link href="/admin/reports?status=pending">Pending ({reportCounts.pending})</Link>
              </TabsTrigger>
              <TabsTrigger value="in_review" asChild>
                <Link href="/admin/reports?status=in_review">In Review ({reportCounts.in_review})</Link>
              </TabsTrigger>
              <TabsTrigger value="resolved" asChild>
                <Link href="/admin/reports?status=resolved">Resolved ({reportCounts.resolved})</Link>
              </TabsTrigger>
              <TabsTrigger value="dismissed" asChild>
                <Link href="/admin/reports?status=dismissed">Dismissed ({reportCounts.dismissed})</Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.length > 0 ? (
          reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Left column: Group info */}
                  <div className="md:col-span-1">
                    <h3 className="font-medium text-lg mb-2">Reported Group</h3>
                    <div className="flex items-start space-x-3">
                      {report.groups?.screenshot_url && (
                        <div className="flex-shrink-0">
                          <Image 
                            src={report.groups.screenshot_url} 
                            alt={report.groups?.name || 'Group screenshot'} 
                            width={80} 
                            height={60} 
                            className="rounded object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <Link href={`/group/${report.group_id}`} className="font-medium hover:underline">
                          {report.groups?.name || 'Unknown Group'}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          ID: {report.group_id.substring(0, 8)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Middle column: Report details */}
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-lg">Report Details</h3>
                      {getStatusBadge(report.status)}
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Reason:</span>
                        <span className="text-sm ml-1">{report.reason}</span>
                      </div>
                      {report.comment && (
                        <div>
                          <span className="text-sm font-medium">Comment:</span>
                          <p className="text-sm text-muted-foreground mt-1">{report.comment}</p>
                        </div>
                      )}
                      <div className="flex items-center space-x-4 text-sm">
                        <div>
                          <span className="font-medium">Reported on:</span>{' '}
                          <span className="text-muted-foreground">{formatDate(report.created_at)}</span>
                        </div>
                        {report.resolved_at && (
                          <div>
                            <span className="font-medium">Resolved on:</span>{' '}
                            <span className="text-muted-foreground">{formatDate(report.resolved_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right column: User info and actions */}
                  <div className="md:col-span-1">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-lg mb-2">Reported by</h3>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            {report.users?.avatar_url ? (
                              <Image 
                                src={report.users.avatar_url} 
                                alt={report.users?.display_name || 'User'} 
                                width={32} 
                                height={32} 
                                className="rounded-full"
                              />
                            ) : (
                              <span className="text-sm">
                                {report.users?.display_name?.charAt(0) || 'U'}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{report.users?.display_name || 'Unknown User'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div>
                        <h3 className="font-medium text-lg mb-2">Actions</h3>
                        <ReportActionButtons 
                          reportId={report.id}
                          currentStatus={report.status}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center justify-center">
                <Flag className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No reports found</h3>
                <p className="text-muted-foreground">
                  {status 
                    ? `There are no ${status} reports at this time.`
                    : 'There are no reports at this time.'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {reports.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-muted-foreground">
            Showing {offset + 1}-{Math.min(offset + limit, (count || 0))} of {count} results
          </div>
          <div className="flex space-x-2">
            {hasPrevPage && (
              <Link 
                href={`/admin/reports?${new URLSearchParams({
                  ...(status && { status }),
                  page: (page - 1).toString(),
                })}`}
              >
                <Button variant="outline" size="sm">Previous</Button>
              </Link>
            )}
            {hasNextPage && (
              <Link 
                href={`/admin/reports?${new URLSearchParams({
                  ...(status && { status }),
                  page: (page + 1).toString(),
                })}`}
              >
                <Button variant="outline" size="sm">Next</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 