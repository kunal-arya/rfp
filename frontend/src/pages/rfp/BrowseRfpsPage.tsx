import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { RfpList } from '@/components/rfp/RfpList';
import { useAllRfps } from '@/hooks/useRfp';
import { Filters } from '@/components/shared/AdvancedFilterBar';
import { RfpFilters } from '@/apis/rfp';
import { ExportActions } from '@/components/shared/ExportActions';
import { PrintView } from '@/components/shared/PrintView';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const BrowseRfpsPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);
  const [filters, setFilters] = useState<RfpFilters>({});
  const printRef = useRef<HTMLDivElement>(null);
  
  // Build API filters including pagination
  const apiFilters: RfpFilters = {
    ...filters,
    page: currentPage,
    limit: pageSize,
  };

  const { data: rfpsData, isLoading } = useAllRfps(apiFilters);

  const handleFilterChange = (newFilters: Filters) => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
    
    const processedFilters: RfpFilters = {
      search: newFilters.search,
      status: newFilters.status,
    };

    // Handle show_new_rfps filter
    if (newFilters.show_new_rfps) {
      processedFilters.show_new_rfps = 1;
    }

    // Handle date range filters
    if (newFilters.dateRange?.from) {
      processedFilters['gte___created_at'] = format(newFilters.dateRange.from, 'yyyy-MM-dd');
    }
    if (newFilters.dateRange?.to) {
      processedFilters['lte___created_at'] = format(newFilters.dateRange.to, 'yyyy-MM-dd');
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

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Available RFPs',
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

  // Only Published RFPs are available to suppliers
  const rfpStatuses = [
    { value: 'Published', label: 'Published' },
    { value: 'Closed', label: 'Closed' },
    { value: 'Awarded', label: 'Awarded' },
  ];

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 space-y-6 sm:space-y-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Browse RFPs</h1>
            <p className="text-muted-foreground">
              Find and respond to Request for Proposals from buyers.
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

      <RfpList
        rfps={rfpsData?.data || []}
        isLoading={isLoading}
        onViewRfp={handleViewRfp}
        onEditRfp={() => {}}
        onDeleteRfp={() => {}}
        onPublishRfp={() => {}}
        onCreateRfp={() => {}}
        showCreateButton={false}
        showActions={false}
        handleFilterChange={handleFilterChange}
        rfpStatuses={rfpStatuses}
        page="BrowseRfpsPage"
      />

      {/* Pagination */}
      {rfpsData && rfpsData.total > pageSize && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, rfpsData.total)} of {rfpsData.total} results
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
            <span className="text-sm text-muted-foreground">
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
        </div>
      )}

      <PrintView
        ref={printRef}
        type="rfp-list"
        data={rfpsData?.data || []}
      />
    </div>
  );
};
