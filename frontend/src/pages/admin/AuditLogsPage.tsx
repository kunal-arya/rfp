import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Search, 
  Filter,
  Download,
  Eye,
  Clock,
  User,
  Activity,
  Loader2
} from 'lucide-react';
import { useAllAuditTrails } from '@/hooks/useAudit';

interface AuditLog {
  id: number;
  user_id: string;
  action: string;
  target_type?: string;
  target_id?: string;
  details?: Record<string, unknown>;
  created_at: string;
  user?: {
    id: string;
    email: string;
  };
}

const AuditLogsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Use real API data
  const { data: auditData, isLoading, error } = useAllAuditTrails({
    page,
    limit,
    search: searchTerm || undefined,
    action: actionFilter !== 'all' ? actionFilter : undefined,
    user_id: userFilter !== 'all' ? userFilter : undefined,
  });

  const auditLogs = auditData?.data || [];
  const total = auditData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load audit logs</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'USER_LOGIN': return 'bg-green-100 text-green-800';
      case 'USER_REGISTERED': return 'bg-blue-100 text-blue-800';
      case 'RFP_CREATED': return 'bg-purple-100 text-purple-800';
      case 'RESPONSE_SUBMITTED': return 'bg-orange-100 text-orange-800';
      case 'USER_DELETED': return 'bg-red-100 text-red-800';
      case 'DOCUMENT_UPLOADED': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (action: string) => {
    if (action.includes('DELETE') || action.includes('FAILED')) return 'text-red-600';
    if (action.includes('LOGIN') || action.includes('CREATED')) return 'text-green-600';
    return 'text-blue-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">System-wide activity monitoring and security logs</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditLogs.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(auditLogs.map(log => log.user)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique users today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditLogs.filter(log => log.action.includes('LOGIN') || log.action.includes('DELETE')).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Authentication & security
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditLogs.filter(log => {
                const logTime = new Date(log.created_at);
                const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
                return logTime > oneHourAgo;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Last hour
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Actions</option>
              <option value="USER_LOGIN">User Login</option>
              <option value="USER_REGISTERED">User Registration</option>
              <option value="RFP_CREATED">RFP Created</option>
              <option value="RESPONSE_SUBMITTED">Response Submitted</option>
              <option value="USER_DELETED">User Deleted</option>
              <option value="DOCUMENT_UPLOADED">Document Uploaded</option>
            </select>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Users</option>
              {Array.from(new Set(auditLogs.map(log => log.user?.email || log.user_id))).map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>

          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail ({auditLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge className={getActionBadgeColor(log.action)}>
                        {log.action}
                      </Badge>
                      <span className="text-sm font-medium">{log.user?.email || log.user_id}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{JSON.stringify(log.details)}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>Target: {log.target_type} ({log.target_id})</span>
                      <span>User ID: {log.user_id}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Security Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">Multiple Failed Login Attempts</p>
                <p className="text-xs text-yellow-600">User: john@example.com - 5 failed attempts in 10 minutes</p>
              </div>
              <span className="text-xs text-yellow-600">2 min ago</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Suspicious Activity Detected</p>
                <p className="text-xs text-red-600">Unusual access pattern from IP: 192.168.1.105</p>
              </div>
              <span className="text-xs text-red-600">15 min ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogsPage;
