import React from 'react';
import { useParams } from 'react-router-dom';
import { useResponseById } from '@/hooks/useResponse';
import { useDeleteDocument, useUploadResponseDocument } from '@/hooks/useDocument';
import { DocumentList } from '@/components/shared/DocumentList';
import { FileUpload } from '@/components/shared/FileUpload';

export const ResponseDetailPage: React.FC = () => {
  const { responseId } = useParams<{ responseId: string }>();
  const { data: response, isLoading, isError } = useResponseById(responseId || '');
  const deleteDocumentMutation = useDeleteDocument();
  const uploadDocumentMutation = useUploadResponseDocument();

  const handleDelete = (docId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteDocumentMutation.mutate(docId);
    }
  };

  const handleFileUpload = (files: File[]) => {
    if (response?.id) {
      files.forEach(file => {
        uploadDocumentMutation.mutate({ responseId: response.id, file });
      });
    }
  };

  if (isLoading) return <div>Loading response details...</div>;
  if (isError) return <div>Error loading response.</div>;
  if (!response) return <div>Response not found.</div>;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Response for: {response.rfp?.title}</h1>
        <p className="text-lg text-muted-foreground">Status: {response.status.label}</p>
        <p className="text-md text-muted-foreground">Submitted by: {response.supplier?.email}</p>
      </div>
      
      <div className="prose max-w-none">
        <h2>Cover Letter</h2>
        <p>{response.cover_letter}</p>
        <h2>Proposed Budget</h2>
        <p>${response.budget.toLocaleString()}</p>
        <h2>Proposed Timeline</h2>
        <p>{response.timeline}</p>
      </div>

      <DocumentList 
        documents={response.documents || []}
        onDelete={handleDelete}
        title="Response Documents"
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
