import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Search, 
  MoreVertical,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAdminResponses } from '@/hooks/useAdmin';
import { useDebounce } from '@/hooks/useDebounce';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Response {
  id: string;
  rfp: {
    id: string;
    title: string;
    buyer: {
      id: string;
      email: string;
    };
  };
  supplier: {
    id: string;
    email: string;
  };
  status: {
    code: string;
    label: string;
  };
  proposed_budget: number;
  description: string;
  submitted_at: string;
  reviewed_at?: string;
  review_notes?: string;
  rating?: number;
}

const ResponseManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const navigate = useNavigate();

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Use admin responses API
  const { data: responsesData, isLoading, error, refetch } = useAdminResponses({
    page,
    limit,
    search: debouncedSearchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const responses = responsesData?.data?.data || [];
  const total = responsesData?.data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    action: '',
    notes: '',
    rating: 0
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading responses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load responses</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

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

  const handleReviewResponse = (response: Response) => {
    setSelectedResponse(response);
    setReviewForm({
      action: '',
      notes: '',
      rating: 0
    });
    setIsReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedResponse || !reviewForm.action) {
      toast.error('Please select an action');
      return;
    }

    setIsActionLoading(true);
    try {
      // TODO: Implement review response API call
      toast.success(`Response ${reviewForm.action} successfully`);
      setIsReviewDialogOpen(false);
      setSelectedResponse(null);
      refetch();
    } catch (error) {
      toast.error(`Failed to ${reviewForm.action} response`);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Response Management</h1>
          <p className="text-muted-foreground">Manage and review all supplier responses</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
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
              {responses.filter(r => r.status.code === 'Submitted').length}
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
              {responses.filter(r => r.status.code === 'Approved').length}
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
              {responses.length > 0 
                ? (responses.reduce((sum, r) => sum + (r.rating || 0), 0) / responses.length).toFixed(1)
                : '0.0'
              }
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Awarded">Awarded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Responses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Responses ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">RFP</th>
                  <th className="text-left py-3 px-4 font-medium">Supplier</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Proposed Budget</th>
                  <th className="text-left py-3 px-4 font-medium">Submitted</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {responses.map((response) => (
                  <tr key={response.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className='text-left'>
                        <div className="font-medium">{response.rfp.title}</div>
                        <div className="text-sm text-muted-foreground">
                          Buyer: {response.rfp.buyer.email}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium">{response.supplier.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusBadgeColor(response.status.code)}>
                        {response.status.label}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium">${response.proposed_budget.toLocaleString()}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(response.created_at), 'MMM dd, yyyy')}
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
                          <DropdownMenuItem onClick={() => navigate(`/responses/${response.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {response.status.code === 'Submitted' && (
                            <>
                              <DropdownMenuItem 
                                className="text-green-600"
                                onClick={() => handleReviewResponse({ ...response, status: { code: 'Approved', label: 'Approved' } })}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleReviewResponse({ ...response, status: { code: 'Rejected', label: 'Rejected' } })}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Response Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Review Response</DialogTitle>
            <DialogDescription>
              Review and provide feedback for this supplier response.
            </DialogDescription>
          </DialogHeader>
          {selectedResponse && (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label>RFP</Label>
                  <p className="text-sm font-medium">{selectedResponse.rfp.title}</p>
                </div>
                <div>
                  <Label>Supplier</Label>
                  <p className="text-sm font-medium">{selectedResponse.supplier.email}</p>
                </div>
                <div>
                  <Label>Proposed Budget</Label>
                  <p className="text-sm font-medium">${selectedResponse.proposed_budget.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Action</Label>
                  <Select value={reviewForm.action} onValueChange={(value) => setReviewForm({ ...reviewForm, action: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approve">Approve</SelectItem>
                      <SelectItem value="reject">Reject</SelectItem>
                      <SelectItem value="request_revision">Request Revision</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Rating (Optional)</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 cursor-pointer ${
                          star <= reviewForm.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Review Notes</Label>
                  <Textarea
                    value={reviewForm.notes}
                    onChange={(e) => setReviewForm({ ...reviewForm, notes: e.target.value })}
                    placeholder="Provide feedback and notes..."
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReview} disabled={isActionLoading}>
              {isActionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResponseManagementPage;
