import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard, useDashboardStats } from '@/hooks/useDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RfpStatusChart } from '@/components/dashboard/charts/RfpStatusChart';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useDashboard();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();

  const isLoading = dashboardLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load dashboard data</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome back!
          </h2>
          <p className="text-lg text-muted-foreground">
            Here's what's happening with your {user?.role.toLowerCase()} activities
          </p>
        </div>

        {isLoading ? (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <StatsCards stats={stats || { totalRfps: 0, publishedRfps: 0, draftRfps: 0, totalResponses: 0, pendingResponses: 0, role: 'Buyer' }} role={user?.role || ''} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <RecentActivity data={dashboardData || { recentRfps: [], recentResponses: [], rfpsNeedingAttention: [], role: 'Buyer' }} role={user?.role || ''} />
              </div>
              <div className="lg:col-span-1">
                <QuickActions />
              </div>
            </div>
            
            {user?.role === 'Buyer' && stats && (
              <RfpStatusChart stats={stats} />
            )}

            {/* Development Info */}
            <Card className="bg-muted/30 border-dashed">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Development Info</CardTitle>
                <CardDescription>
                  API Status and Data Preview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <strong>API Status:</strong> 
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      Connected
                    </span>
                  </div>
                  <div>
                    <strong>Data Loaded:</strong> 
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {dashboardData ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};
