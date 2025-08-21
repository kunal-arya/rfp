import React from 'react';
import { useParams } from 'react-router-dom';
import { useRfpById } from '@/hooks/useRfp';
import { useDeleteDocument, useUploadRfpDocument } from '@/hooks/useDocument';
import { DocumentList } from '@/components/shared/DocumentList';
import { FileUpload } from '@/components/shared/FileUpload';

export const RfpDetailPage: React.FC = () => {
  const { rfpId } = useParams<{ rfpId: string }>();
  const { data: rfp, isLoading, isError } = useRfpById(rfpId || '');
  const deleteDocumentMutation = useDeleteDocument();
  const uploadDocumentMutation = useUploadRfpDocument();

  const handleDelete = (docId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteDocumentMutation.mutate(docId);
    }
  };

  const handleFileUpload = (files: File[]) => {
    if (rfp?.current_version?.id) {
      files.forEach(file => {
        uploadDocumentMutation.mutate({ rfpVersionId: rfp.current_version.id, file });
      });
    }
  };

  if (isLoading) return <div>Loading RFP details...</div>;
  if (isError) return <div>Error loading RFP.</div>;
  if (!rfp) return <div>RFP not found.</div>;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">{rfp.title}</h1>
        <p className="text-lg text-muted-foreground">Status: {rfp.status.label}</p>
      </div>
      
      <div className="prose max-w-none">
        <h2>Description</h2>
        <p>{rfp.current_version?.description}</p>
        <h2>Requirements</h2>
        <p>{rfp.current_version?.requirements}</p>
      </div>

      <DocumentList 
        documents={rfp.current_version?.documents || []}
        onDelete={handleDelete}
        title="RFP Documents"
      />
      
      <div>
        <h2 className="text-2xl font-bold mb-4">Upload New Documents</h2>
        <FileUpload 
          onFilesSelect={handleFileUpload} 
          isLoading={uploadDocumentMutation.isPending} 
        />
      </div>
    </div>
  );
};
