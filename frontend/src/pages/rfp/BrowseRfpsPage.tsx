import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { RfpList } from '@/components/rfp/RfpList';
import { useAllRfps } from '@/hooks/useRfp';
import { AdvancedFilterBar, Filters } from '@/components/shared/AdvancedFilterBar';
import { ExportActions } from '@/components/shared/ExportActions';
import { PrintView } from '@/components/shared/PrintView';
import { format } from 'date-fns';

export const BrowseRfpsPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<any>({});
  const printRef = useRef<HTMLDivElement>(null);
  
  const { data: rfpsData, isLoading } = useAllRfps(filters);

  const handleFilterChange = (newFilters: Filters) => {
    const apiFilters = {
      ...newFilters,
      deadline_from: newFilters.dateRange?.from ? format(newFilters.dateRange.from, 'yyyy-MM-dd') : undefined,
      deadline_to: newFilters.dateRange?.to ? format(newFilters.dateRange.to, 'yyyy-MM-dd') : undefined,
      budget_min: newFilters.budgetMin,
      budget_max: newFilters.budgetMax,
      dateRange: undefined,
    };
    setFilters(apiFilters);
  };
  
  const handleViewRfp = (rfpId: string) => {
    navigate(`/rfps/${rfpId}`);
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Available RFPs',
  });

  // Only Published RFPs are available to suppliers
  const rfpStatuses = [{ value: 'Published', label: 'Published' }];

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

      <AdvancedFilterBar onFilterChange={handleFilterChange} statuses={rfpStatuses} />

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
      />

      <PrintView
        ref={printRef}
        type="rfp-list"
        data={rfpsData?.data || []}
      />
    </div>
  );
};
