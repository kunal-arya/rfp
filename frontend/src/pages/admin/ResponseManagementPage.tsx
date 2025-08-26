import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Search, 
  Filter,
  MoreVertical,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Star
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Response {
  id: string;
  rfpTitle: string;
  supplier: string;
  status: string;
  submittedAt: string;
  price: string;
  rating: number;
  reviewStatus: string;
  buyer: string;
  category: string;
}

const ResponseManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reviewFilter, setReviewFilter] = useState('all');

  // Mock data - will be replaced with real API calls
  const responses: Response[] = [
    {
      id: '1',
      rfpTitle: 'Website Development Project',
      supplier: 'WebDev Solutions',
      status: 'Submitted',
      submittedAt: '2024-01-20T10:30:00Z',
      price: '$18,000',
      rating: 4.5,
      reviewStatus: 'Pending',
      buyer: 'TechCorp Inc.',
      category: 'Technology'
    },
    {
      id: '2',
      rfpTitle: 'Marketing Campaign Design',
      supplier: 'Creative Agency Pro',
      status: 'Under Review',
      submittedAt: '2024-01-19T14:20:00Z',
      price: '$8,500',
      rating: 4.8,
      reviewStatus: 'In Progress',
      buyer: 'MarketingPro LLC',
      category: 'Marketing'
    },
    {
      id: '3',
      rfpTitle: 'Mobile App Development',
      supplier: 'AppStudio Tech',
      status: 'Approved',
      submittedAt: '2024-01-18T09:15:00Z',
      price: '$42,000',
      rating: 4.9,
      reviewStatus: 'Completed',
      buyer: 'StartupXYZ',
      category: 'Technology'
    },
    {
      id: '4',
      rfpTitle: 'Logo and Branding Design',
      supplier: 'Design Masters',
      status: 'Rejected',
      submittedAt: '2024-01-17T16:45:00Z',
      price: '$3,200',
      rating: 3.2,
      reviewStatus: 'Completed',
      buyer: 'DesignStudio',
      category: 'Design'
    },
    {
      id: '5',
      rfpTitle: 'Content Writing Services',
      supplier: 'Content Creators Co.',
      status: 'Submitted',
      submittedAt: '2024-01-16T11:30:00Z',
      price: '$2,500',
      rating: 4.3,
      reviewStatus: 'Pending',
      buyer: 'ContentHub',
      category: 'Content'
    }
  ];

  const filteredResponses = responses.filter(response => {
    const matchesSearch = response.rfpTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         response.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         response.buyer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || response.status === statusFilter;
    const matchesReview = reviewFilter === 'all' || response.reviewStatus === reviewFilter;
    
    return matchesSearch && matchesStatus && matchesReview;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Submitted': return 'bg-blue-100 text-blue-800';
      case 'Under Review': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Awarded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReviewStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-xs text-gray-600">({rating})</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Response Management</h1>
          <p className="text-muted-foreground">Manage and review all supplier responses</p>
        </div>
        <Button>
          <MessageSquare className="h-4 w-4 mr-2" />
          Review Responses
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{responses.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12</span> this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {responses.filter(r => r.reviewStatus === 'Pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {responses.filter(r => r.status === 'Approved').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(responses.reduce((sum, r) => sum + r.rating, 0) / responses.length).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Overall quality score
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
                  placeholder="Search responses..."
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
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Awarded">Awarded</option>
            </select>
            <select
              value={reviewFilter}
              onChange={(e) => setReviewFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Review Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Responses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Responses ({filteredResponses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">RFP</th>
                  <th className="text-left py-3 px-4 font-medium">Supplier</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Price</th>
                  <th className="text-left py-3 px-4 font-medium">Rating</th>
                  <th className="text-left py-3 px-4 font-medium">Review Status</th>
                  <th className="text-left py-3 px-4 font-medium">Submitted</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResponses.map((response) => (
                  <tr key={response.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{response.rfpTitle}</div>
                        <div className="text-sm text-muted-foreground">
                          Buyer: {response.buyer}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium">{response.supplier}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusBadgeColor(response.status)}>
                        {response.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium">{response.price}</div>
                    </td>
                    <td className="py-3 px-4">
                      {renderStars(response.rating)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getReviewStatusBadgeColor(response.reviewStatus)}>
                        {response.reviewStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-muted-foreground">
                        {new Date(response.submittedAt).toLocaleDateString()}
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
                            Review Response
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-green-600">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
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
              <Eye className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium">Review All</p>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-medium">Bulk Approve</p>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <XCircle className="h-6 w-6 mx-auto mb-2 text-red-600" />
              <p className="text-sm font-medium">Bulk Reject</p>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <MessageSquare className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="text-sm font-medium">Send Feedback</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResponseManagementPage;
