import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '@/apis/document';

export const useUploadRfpDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rfpVersionId, file }: { rfpVersionId: string; file: File }) =>
      documentApi.uploadForRfp(rfpVersionId, file),
    onSuccess: (data) => {
      // Invalidate queries related to the RFP to refetch documents
      queryClient.invalidateQueries({ queryKey: ['rfp', data.rfp_version?.rfp_id] });
    },
    onError: (error) => {
      console.error('Failed to upload RFP document:', error);
      // You might want to show a toast notification here
    },
  });
};

export const useUploadResponseDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ responseId, file }: { responseId: string; file: File }) =>
      documentApi.uploadForResponse(responseId, file),
    onSuccess: (data) => {
      // Invalidate queries related to the response to refetch documents
      queryClient.invalidateQueries({ queryKey: ['response', data.rfp_response_id] });
    },
    onError: (error) => {
      console.error('Failed to upload response document:', error);
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => documentApi.deleteDocument(documentId),
    onSuccess: (_, documentId) => {
      // Optimistically remove the document from any caches if possible
      // or just invalidate relevant queries
      console.log(`Document ${documentId} deleted`);
      queryClient.invalidateQueries({ queryKey: ['rfps'] });
      queryClient.invalidateQueries({ queryKey: ['responses'] });
      // More specific invalidations would be better here if possible
    },
    onError: (error) => {
      console.error('Failed to delete document:', error);
    },
  });
};
