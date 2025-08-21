import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RfpList } from '@/components/rfp/RfpList';
import { useAllRfps } from '@/hooks/useRfp';

export const BrowseRfpsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: rfpsData, isLoading } = useAllRfps();

  const handleViewRfp = (rfpId: string) => {
    navigate(`/rfps/${rfpId}`);
  };

  const handleCreateRfp = () => {
    navigate('/rfps/create');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse RFPs</h1>
        <p className="text-muted-foreground">
          Find and respond to Request for Proposals from buyers.
        </p>
      </div>

      <RfpList
        rfps={rfpsData?.data || []}
        isLoading={isLoading}
        onViewRfp={handleViewRfp}
        onEditRfp={() => {}} // Not available for suppliers
        onDeleteRfp={() => {}} // Not available for suppliers
        onPublishRfp={() => {}} // Not available for suppliers
        onCreateRfp={handleCreateRfp}
        showCreateButton={false}
        showActions={false}
      />
    </div>
  );
};
