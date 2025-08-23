import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { RfpList } from '@/components/rfp/RfpList';
import { useMyRfps, useDeleteRfp, usePublishRfp } from '@/hooks/useRfp';
import { AdvancedFilterBar, Filters } from '@/components/shared/AdvancedFilterBar';
import { ExportActions } from '@/components/shared/ExportActions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const MyRfpsPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [filters, setFilters] = useState<any>({});
  const printRef = useRef<HTMLDivElement>(null);

  // Build API filters including pagination
  const apiFilters = {
    ...filters,
    page: currentPage,
    limit: pageSize,
  };

  const { data: rfpsData, isLoading } = useMyRfps(apiFilters);
  const deleteRfpMutation = useDeleteRfp();
  const publishRfpMutation = usePublishRfp();

  const handleFilterChange = (newFilters: Filters) => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
    
    const processedFilters: any = {
      search: newFilters.search,
      status: newFilters.status,
    };

    // Handle date range filters
    if (newFilters.dateRange?.from) {
      processedFilters['gte___deadline'] = format(newFilters.dateRange.from, 'yyyy-MM-dd');
    }
    if (newFilters.dateRange?.to) {
      processedFilters['lte___deadline'] = format(newFilters.dateRange.to, 'yyyy-MM-dd');
    }

    // Handle budget filters
    if (newFilters.budgetMin) {
      processedFilters['gte___budget_min'] = newFilters.budgetMin;
    }
    if (newFilters.budgetMax) {
      processedFilters['lte___budget_max'] = newFilters.budgetMax;
    }

    setFilters(processedFilters);
  };

  const handleViewRfp = (rfpId: string) => {
    navigate(`/rfps/${rfpId}`);
  };

  const handleEditRfp = (rfpId: string) => {
    navigate(`/rfps/${rfpId}/edit`);
  };

  const handleDeleteRfp = (rfpId: string) => {
    if (confirm('Are you sure you want to delete this RFP? This action cannot be undone.')) {
      deleteRfpMutation.mutate(rfpId);
    }
  };

  const handlePublishRfp = (rfpId: string) => {
    if (confirm('Are you sure you want to publish this RFP? It will be visible to all suppliers.')) {
      publishRfpMutation.mutate(rfpId);
    }
  };

  const handleCreateRfp = () => {
    navigate('/rfps/create');
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'My RFPs',
  });

  const handleNextPage = () => {
    if (rfpsData && currentPage < Math.ceil(rfpsData.total / pageSize)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const rfpStatuses = [
    { value: 'Draft', label: 'Draft' },
    { value: 'Published', label: 'Published' },
    { value: 'Under Review', label: 'Under Review' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">My RFPs</h1>
            <p className="text-muted-foreground">
              Manage your Request for Proposals and track responses from suppliers.
            </p>
          </div>
          <div className="flex gap-2">
            <ExportActions
              type="rfp-list"
              data={rfpsData?.data || []}
              onPrint={handlePrint}
            />
          </div>
        </div>
      </div>

      <AdvancedFilterBar onFilterChange={handleFilterChange} statuses={rfpStatuses} />

      <div className="space-y-6">
        <RfpList
          rfps={rfpsData?.data || []}
          isLoading={isLoading}
          onViewRfp={handleViewRfp}
          onEditRfp={handleEditRfp}
          onDeleteRfp={handleDeleteRfp}
          onPublishRfp={handlePublishRfp}
          onCreateRfp={handleCreateRfp}
          showCreateButton={true}
          showActions={true}
        />

        {/* Pagination */}
        {rfpsData && rfpsData.total > pageSize && (
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, rfpsData.total)} of {rfpsData.total} RFPs
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm font-medium px-3 py-1 bg-muted rounded">
                  Page {currentPage} of {Math.ceil(rfpsData.total / pageSize)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage >= Math.ceil(rfpsData.total / pageSize)}
                >
                  Next
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
