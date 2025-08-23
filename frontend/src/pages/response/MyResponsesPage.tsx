import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponseList } from '@/components/response/ResponseList';
import { useMyResponses } from '@/hooks/useResponse';
import { useDeleteResponse, useSubmitResponse } from '@/hooks/useResponse';
import { AdvancedFilterBar, Filters } from '@/components/shared/AdvancedFilterBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const MyResponsesPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [filters, setFilters] = useState<any>({});

  // Build API filters including pagination
  const apiFilters = {
    ...filters,
    page: currentPage,
    limit: pageSize,
  };

  const { data: responsesData, isLoading } = useMyResponses(apiFilters);
  const deleteResponseMutation = useDeleteResponse();
  const submitResponseMutation = useSubmitResponse();

  const handleFilterChange = (newFilters: Filters) => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
    
    const processedFilters: any = {
      search: newFilters.search,
      status: newFilters.status,
    };

    // Handle date range filters
    if (newFilters.dateRange?.from) {
      processedFilters['gte___created_at'] = format(newFilters.dateRange.from, 'yyyy-MM-dd');
    }
    if (newFilters.dateRange?.to) {
      processedFilters['lte___created_at'] = format(newFilters.dateRange.to, 'yyyy-MM-dd');
    }

    // Handle budget filters
    if (newFilters.budgetMin) {
      processedFilters['gte___proposed_budget'] = newFilters.budgetMin;
    }
    if (newFilters.budgetMax) {
      processedFilters['lte___proposed_budget'] = newFilters.budgetMax;
    }

    setFilters(processedFilters);
  };

  const handleViewResponse = (responseId: string) => {
    navigate(`/responses/${responseId}`);
  };

  const handleEditResponse = (responseId: string) => {
    navigate(`/responses/${responseId}/edit`);
  };

  const handleDeleteResponse = (responseId: string) => {
    if (confirm('Are you sure you want to delete this response? This action cannot be undone.')) {
      deleteResponseMutation.mutate(responseId);
    }
  };

  const handleSubmitResponse = (responseId: string) => {
    if (confirm('Are you sure you want to submit this response? You won\'t be able to edit it after submission.')) {
      submitResponseMutation.mutate(responseId);
    }
  };

  const handleCreateResponse = () => {
    navigate('/responses/create');
  };

  const handleNextPage = () => {
    if (responsesData && currentPage < Math.ceil(responsesData.total / pageSize)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const responseStatuses = [
    { value: 'Draft', label: 'Draft' },
    { value: 'Submitted', label: 'Submitted' },
    { value: 'Under Review', label: 'Under Review' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Awarded', label: 'Awarded' },
  ];

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 space-y-6 sm:space-y-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">My Responses</h1>
        <p className="text-muted-foreground">
          Manage your responses to RFPs and track their status.
        </p>
      </div>

      <AdvancedFilterBar onFilterChange={handleFilterChange} statuses={responseStatuses} />

      <div className="space-y-6">
        <ResponseList
          responses={responsesData?.data || []}
          isLoading={isLoading}
          onViewResponse={handleViewResponse}
          onEditResponse={handleEditResponse}
          onDeleteResponse={handleDeleteResponse}
          onSubmitResponse={handleSubmitResponse}
          onApproveResponse={() => {}} // Not available for suppliers
          onRejectResponse={() => {}} // Not available for suppliers
          onCreateResponse={handleCreateResponse}
          showCreateButton={true}
          showActions={true}
          showBuyerActions={false}
        />

        {/* Pagination */}
        {responsesData && responsesData.total > pageSize && (
          <Card>
            <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4">
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, responsesData.total)} of {responsesData.total} responses
              </div>
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
                <span className="text-sm font-medium px-3 py-1 bg-muted rounded">
                  {currentPage} / {Math.ceil(responsesData.total / pageSize)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage >= Math.ceil(responsesData.total / pageSize)}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
