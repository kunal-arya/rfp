import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Search, 
  Filter,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  Users,
  Calendar,
  DollarSign,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMyRfps } from '@/hooks/useRfp';

interface Rfp {
  id: string;
  title: string;
  buyer: {
    id: string;
    email: string;
  };
  status: {
    code: string;
    label: string;
  };
  current_version: {
    budget_min?: number;
    budget_max?: number;
    deadline: string;
    description: string;
  };
  supplier_responses: any[];
  created_at: string;
}

const RfpManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Use real API data
  const { data: rfpsData, isLoading, error } = useMyRfps({
    page,
    limit,
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const rfps = rfpsData?.data || [];
  const total = rfpsData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading RFPs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load RFPs</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Published': return 'bg-blue-100 text-blue-800';
      case 'Closed': return 'bg-yellow-100 text-yellow-800';
      case 'Awarded': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Paused': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'Technology': return 'bg-purple-100 text-purple-800';
      case 'Marketing': return 'bg-pink-100 text-pink-800';
      case 'Design': return 'bg-indigo-100 text-indigo-800';
      case 'Content': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">RFP Management</h1>
          <p className="text-muted-foreground">Manage and oversee all RFPs in the system</p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Create RFP
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total RFPs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rfps.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5</span> this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rfps.filter(rfp => rfp.status.code === 'Published').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active RFPs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rfps.reduce((sum, rfp) => sum + rfp.supplier_responses.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all RFPs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Awarded</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rfps.filter(rfp => rfp.status.code === 'Awarded').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
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
                  placeholder="Search RFPs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Closed">Closed</option>
              <option value="Awarded">Awarded</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Paused">Paused</option>
            </select>

          </div>
        </CardContent>
      </Card>

      {/* RFPs Table */}
      <Card>
        <CardHeader>
          <CardTitle>RFPs ({rfps.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">RFP</th>
                  <th className="text-left py-3 px-4 font-medium">Buyer</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-left py-3 px-4 font-medium">Budget</th>
                  <th className="text-left py-3 px-4 font-medium">Responses</th>
                  <th className="text-left py-3 px-4 font-medium">Deadline</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rfps.map((rfp) => (
                  <tr key={rfp.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{rfp.title}</div>
                        <div className="text-sm text-muted-foreground">
                          Created: {new Date(rfp.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium">{rfp.buyer.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusBadgeColor(rfp.status.code)}>
                        {rfp.status.label}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-muted-foreground">-</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        {rfp.current_version.budget_min && rfp.current_version.budget_max 
                          ? `$${rfp.current_version.budget_min.toLocaleString()} - $${rfp.current_version.budget_max.toLocaleString()}`
                          : 'Not specified'
                        }
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium">{rfp.supplier_responses.length}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-muted-foreground">
                        {new Date(rfp.current_version.deadline).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit RFP
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="h-4 w-4 mr-2" />
                            View Responses
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete RFP
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <FileText className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium">Create RFP</p>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-medium">View Responses</p>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="text-sm font-medium">Schedule Review</p>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <DollarSign className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <p className="text-sm font-medium">Award RFP</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RfpManagementPage;
