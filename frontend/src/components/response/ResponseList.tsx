import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SupplierResponse } from '@/apis/types';
import { MessageSquare, Search, Plus, DollarSign, Calendar, Eye, Edit, Trash2, CheckCircle, XCircle, Send } from 'lucide-react';

interface ResponseListProps {
  responses: SupplierResponse[];
  isLoading: boolean;
  onViewResponse: (responseId: string) => void;
  onEditResponse: (responseId: string) => void;
  onDeleteResponse: (responseId: string) => void;
  onSubmitResponse: (responseId: string) => void;
  onApproveResponse: (responseId: string) => void;
  onRejectResponse: (responseId: string) => void;
  onCreateResponse: () => void;
  showCreateButton?: boolean;
  showActions?: boolean;
  showBuyerActions?: boolean;
}

export const ResponseList: React.FC<ResponseListProps> = ({
  responses,
  isLoading,
  onViewResponse,
  onEditResponse,
  onDeleteResponse,
  onSubmitResponse,
  onApproveResponse,
  onRejectResponse,
  onCreateResponse,
  showCreateButton = true,
  showActions = true,
  showBuyerActions = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredResponses = responses.filter((response) => {
    const matchesSearch = response.rfp?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         response.cover_letter.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || response.status.code === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'under review':
        return 'bg-orange-100 text-orange-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatBudget = (budget: number) => {
    return `$${budget.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Responses</h2>
          <p className="text-muted-foreground">
            {filteredResponses.length} of {responses.length} responses
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search responses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background"
          >
            <option value="all">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          
          {showCreateButton && (
            <Button onClick={onCreateResponse} className="whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2" />
              Create Response
            </Button>
          )}
        </div>
      </div>

      {/* Response List */}
      {filteredResponses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No responses found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first response'
              }
            </p>
            {showCreateButton && (
              <Button onClick={onCreateResponse}>
                <Plus className="h-4 w-4 mr-2" />
                Create Response
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredResponses.map((response) => (
            <Card key={response.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold line-clamp-1">
                        Response to: {response.rfp?.title}
                      </h3>
                      <Badge className={getStatusColor(response.status.code)}>
                        {response.status.label}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground mb-3 line-clamp-2">
                      {response.cover_letter}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>Budget: {formatBudget(response.proposed_budget || 0)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Timeline: {response.timeline}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>Created: {formatDate(response.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {showActions && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewResponse(response.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      
                      {response.status.code === 'Draft' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditResponse(response.id)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSubmitResponse(response.id)}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Submit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDeleteResponse(response.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </>
                      )}
                      
                      {showBuyerActions && response.status.code === 'Submitted' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onApproveResponse(response.id)}
                            className="text-green-600 hover:text-green-600"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onRejectResponse(response.id)}
                            className="text-red-600 hover:text-red-600"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
