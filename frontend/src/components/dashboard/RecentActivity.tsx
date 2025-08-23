import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardData } from '@/apis/types';
import { FileText, Users, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMyAuditTrails } from '@/hooks/useAudit';
import { AuditTrailList } from '@/components/shared/AuditTrailList';

interface RecentActivityProps {
  data: DashboardData;
  role: string;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ data, role }) => {
  const isBuyer = role === 'Buyer';
  const { data: auditData } = useMyAuditTrails({ limit: 5 });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'text-green-600 bg-green-50';
      case 'draft':
        return 'text-gray-600 bg-gray-50';
      case 'under review':
        return 'text-orange-600 bg-orange-50';
      case 'approved':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const renderRfpItem = (rfp: any) => (
    <div key={rfp.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="p-2 bg-blue-50 rounded-lg">
        <FileText className="h-4 w-4 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p 
          className="text-sm font-medium text-foreground truncate cursor-pointer hover:text-primary transition-colors"
          onClick={() => window.location.href = `/rfps/${rfp.id}`}
        >
          {rfp.title}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDate(rfp.created_at)}
        </p>
      </div>
      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(rfp.status.code)}`}>
        {rfp.status.label}
      </span>
    </div>
  );

  const renderResponseItem = (response: any) => (
    <div key={response.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="p-2 bg-purple-50 rounded-lg">
        <Users className="h-4 w-4 text-purple-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p 
          className="text-sm font-medium text-foreground truncate cursor-pointer hover:text-primary transition-colors"
          onClick={() => window.location.href = `/responses/${response.id}`}
        >
          Response to RFP #{response.rfp_id}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDate(response.created_at)}
        </p>
      </div>
      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(response.status.code)}`}>
        {response.status.label}
      </span>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Recent RFPs */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileText className="h-5 w-5 text-blue-600" />
            Recent RFPs
          </CardTitle>
          <CardDescription>
            {isBuyer ? 'Your recently created RFPs' : 'Recently published RFPs'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {(() => {
            const rfps = isBuyer ? data.recentRfps : data.availableRfps;
            return rfps && rfps.length > 0 ? (
              rfps.slice(0, 5).map(renderRfpItem)
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No RFPs found
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Recent Responses */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="h-5 w-5 text-purple-600" />
            Recent Responses
          </CardTitle>
          <CardDescription>
            {isBuyer ? 'Recent responses to your RFPs' : 'Your recent responses'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {(() => {
            const responses = data.myResponses || data.recentResponses;
            return responses && responses.length > 0 ? (
              responses.slice(0, 5).map(renderResponseItem)
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No responses found
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Activity className="h-5 w-5 text-green-600" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Your recent system activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {auditData?.data && auditData.data.length > 0 ? (
            <div className="space-y-2">
              {auditData.data.slice(0, 5).map((audit) => (
                <div key={audit.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="p-1.5 bg-green-50 rounded-lg">
                    <Activity className="h-3 w-3 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {audit.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(audit.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <Link 
                  to="/audit" 
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All Activity →
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No recent activity
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
