import React, { useState } from 'react';
import { useMyAuditTrails, useTargetAuditTrails, useAllAuditTrails } from '@/hooks/useAudit';
import { AuditTrailList } from '@/components/shared/AuditTrailList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Filter, RefreshCw, Activity } from 'lucide-react';

const AuditTrailPage: React.FC = () => {
  const { user } = useAuth();
  const [view, setView] = useState<'my' | 'target' | 'all'>('my');
  const [targetType, setTargetType] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('');

  // Queries based on view
  const myAuditTrails = useMyAuditTrails({
    search: searchTerm || undefined,
    action: actionFilter || undefined,
  });

  const targetAuditTrails = useTargetAuditTrails(
    targetType,
    targetId,
    {
      search: searchTerm || undefined,
      action: actionFilter || undefined,
    }
  );

  const allAuditTrails = useAllAuditTrails({
    search: searchTerm || undefined,
    action: actionFilter || undefined,
  });

  // Get current data based on view
  const getCurrentData = () => {
    switch (view) {
      case 'my':
        return myAuditTrails;
      case 'target':
        return targetAuditTrails;
      case 'all':
        return allAuditTrails;
      default:
        return myAuditTrails;
    }
  };

  const currentData = getCurrentData();

  const handleRefresh = () => {
    currentData.refetch();
  };

  const getViewTitle = () => {
    switch (view) {
      case 'my':
        return 'My Activity';
      case 'target':
        return `Activity for ${targetType} ${targetId}`;
      case 'all':
        return 'All Activity';
      default:
        return 'Audit Trail';
    }
  };

  const getViewDescription = () => {
    switch (view) {
      case 'my':
        return 'Your recent activity history';
      case 'target':
        return `Activity history for ${targetType} ${targetId}`;
      case 'all':
        return 'Complete system activity history (Admin only)';
      default:
        return 'Activity history';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Trail</h1>
          <p className="text-muted-foreground">
            Track and monitor system activity and user actions
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={currentData.isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${currentData.isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* View Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            View Options
          </CardTitle>
          <CardDescription>Select what type of audit trail to view</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={view === 'my' ? 'default' : 'outline'}
              onClick={() => setView('my')}
            >
              My Activity
            </Button>
            <Button
              variant={view === 'target' ? 'default' : 'outline'}
              onClick={() => setView('target')}
            >
              Target Activity
            </Button>
            {user?.role === 'Admin' && (
              <Button
                variant={view === 'all' ? 'default' : 'outline'}
                onClick={() => setView('all')}
              >
                All Activity
              </Button>
            )}
          </div>

          {/* Target Selection for Target View */}
          {view === 'target' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetType">Target Type</Label>
                <Select value={targetType} onValueChange={setTargetType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RFP">RFP</SelectItem>
                    <SelectItem value="SupplierResponse">Response</SelectItem>
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="Document">Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetId">Target ID</Label>
                <Input
                  id="targetId"
                  placeholder="Enter target ID"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter audit trail entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search in details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="action">Action Type</Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All actions</SelectItem>
                  <SelectItem value="RFP_CREATED">RFP Created</SelectItem>
                  <SelectItem value="RFP_UPDATED">RFP Updated</SelectItem>
                  <SelectItem value="RFP_PUBLISHED">RFP Published</SelectItem>
                  <SelectItem value="RESPONSE_CREATED">Response Created</SelectItem>
                  <SelectItem value="RESPONSE_SUBMITTED">Response Submitted</SelectItem>
                  <SelectItem value="DOCUMENT_UPLOADED">Document Uploaded</SelectItem>
                  <SelectItem value="DOCUMENT_DELETED">Document Deleted</SelectItem>
                  <SelectItem value="USER_LOGIN">User Login</SelectItem>
                  <SelectItem value="USER_REGISTERED">User Registered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Trail List */}
      <AuditTrailList
        auditTrails={currentData.data?.data || []}
        title={getViewTitle()}
        description={getViewDescription()}
        isLoading={currentData.isLoading}
      />

      {/* Error Display */}
      {currentData.error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p>Error loading audit trail: {currentData.error.message}</p>
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {currentData.data?.data && currentData.data.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Badge variant="secondary">
                Total Entries: {currentData.data.data.length}
              </Badge>
              <Badge variant="secondary">
                Date Range: {new Date(currentData.data.data[currentData.data.data.length - 1].created_at).toLocaleDateString()} - {new Date(currentData.data.data[0].created_at).toLocaleDateString()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AuditTrailPage;
