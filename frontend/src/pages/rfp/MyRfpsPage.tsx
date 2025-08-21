import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RfpList } from '@/components/rfp/RfpList';
import { useMyRfps } from '@/hooks/useRfp';
import { useDeleteRfp, usePublishRfp } from '@/hooks/useRfp';

export const MyRfpsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: rfpsData, isLoading } = useMyRfps();
  const deleteRfpMutation = useDeleteRfp();
  const publishRfpMutation = usePublishRfp();

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My RFPs</h1>
        <p className="text-muted-foreground">
          Manage your Request for Proposals and track responses from suppliers.
        </p>
      </div>

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
    </div>
  );
};
