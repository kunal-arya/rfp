import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardData } from '@/apis/types';
import { FileText, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecentActivityProps {
  data: DashboardData;
  role: string;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ data, role }) => {
  const isBuyer = role === 'Buyer';

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
        <Link to={`/rfps/${rfp.id}`}>
          <p className="text-sm font-medium text-foreground truncate">{rfp.title}</p>
        </Link>
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
        <p className="text-sm font-medium text-foreground truncate">
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent RFPs */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-blue-600" />
            Recent RFPs
          </CardTitle>
          <CardDescription>
            {isBuyer ? 'Your recently created RFPs' : 'Recently published RFPs'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {((isBuyer ? data.recentRfps : data.availableRfps) || []).length > 0 ? (
            (isBuyer ? data.recentRfps : data.availableRfps).slice(0, 5).map(renderRfpItem)
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{isBuyer ? 'No recent RFPs' : 'No available RFPs'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Responses */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-purple-600" />
            Recent Responses
          </CardTitle>
          <CardDescription>
            {isBuyer ? 'Recent responses to your RFPs' : 'Your recent responses'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.recentResponses && data.recentResponses.length > 0 ? (
            data.recentResponses.slice(0, 5).map(renderResponseItem)
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent responses</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
