import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { RfpList } from '@/components/rfp/RfpList';
import { useMyRfps, useDeleteRfp, usePublishRfp } from '@/hooks/useRfp';
import { AdvancedFilterBar, Filters } from '@/components/shared/AdvancedFilterBar';
import { ExportActions } from '@/components/shared/ExportActions';
import { BulkOperations, getRfpBulkActions } from '@/components/shared/BulkOperations';
import { PrintView } from '@/components/shared/PrintView';
import { format } from 'date-fns';

export const MyRfpsPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<any>({});
  const [selectedRfpIds, setSelectedRfpIds] = useState<string[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  const { data: rfpsData, isLoading } = useMyRfps(filters);
  const deleteRfpMutation = useDeleteRfp();
  const publishRfpMutation = usePublishRfp();

  const handleFilterChange = (newFilters: Filters) => {
    const apiFilters = {
      ...newFilters,
      deadline_from: newFilters.dateRange?.from ? format(newFilters.dateRange.from, 'yyyy-MM-dd') : undefined,
      deadline_to: newFilters.dateRange?.to ? format(newFilters.dateRange.to, 'yyyy-MM-dd') : undefined,
      budget_min: newFilters.budgetMin,
      budget_max: newFilters.budgetMax,
      dateRange: undefined, // Don't pass this to API
    };
    setFilters(apiFilters);
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

  const handleBulkAction = (action: string, ids: string[]) => {
    switch (action) {
      case 'delete':
        ids.forEach(id => handleDeleteRfp(id));
        break;
      case 'publish':
        ids.forEach(id => handlePublishRfp(id));
        break;
      case 'export':
        const selectedRfps = (rfpsData?.data || []).filter(rfp => ids.includes(rfp.id));
        if (selectedRfps.length > 0) {
          // This would use the export utilities we created
          console.log('Exporting RFPs:', selectedRfps);
        }
        break;
      default:
        console.log(`Bulk action ${action} not implemented yet`);
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

      <BulkOperations
        selectedIds={selectedRfpIds}
        onSelectionChange={setSelectedRfpIds}
        onBulkAction={handleBulkAction}
        totalItems={rfpsData?.data?.length || 0}
        availableActions={getRfpBulkActions()}
      />

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

      <PrintView
        ref={printRef}
        type="rfp-list"
        data={rfpsData?.data || []}
      />
    </div>
  );
};
