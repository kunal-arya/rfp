import React from 'react';
import { RfpForm } from '@/components/rfp/RfpForm';
import { useCreateRfp } from '@/hooks/useRfp';
import { CreateRfpData } from '@/apis/rfp';

export const CreateRfpPage: React.FC = () => {
  const createRfpMutation = useCreateRfp();

  const handleSubmit = (data: CreateRfpData) => {
    createRfpMutation.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New RFP</h1>
        <p className="text-muted-foreground">
          Create a new Request for Proposal to find the right suppliers for your project.
        </p>
      </div>

      <RfpForm
        mode="create"
        onSubmit={handleSubmit}
        isLoading={createRfpMutation.isPending}
        error={createRfpMutation.error?.message || null}
      />
    </div>
  );
};
