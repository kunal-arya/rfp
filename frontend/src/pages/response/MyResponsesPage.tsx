import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponseList } from '@/components/response/ResponseList';
import { useMyResponses } from '@/hooks/useResponse';
import { useDeleteResponse, useSubmitResponse } from '@/hooks/useResponse';

export const MyResponsesPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: responsesData, isLoading } = useMyResponses();
  const deleteResponseMutation = useDeleteResponse();
  const submitResponseMutation = useSubmitResponse();

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Responses</h1>
        <p className="text-muted-foreground">
          Manage your responses to RFPs and track their status.
        </p>
      </div>

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
    </div>
  );
};
