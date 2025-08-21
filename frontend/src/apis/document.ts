import apiClient from './client';
import { Document } from './types';

export const documentApi = {
  // Upload document for an RFP
  uploadForRfp: async (rfpVersionId: string, file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append('document', file);

    const response = await apiClient.post<Document>(`/rfp/${rfpVersionId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload document for a Response
  uploadForResponse: async (responseId: string, file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append('document', file);

    const response = await apiClient.post<Document>(`/rfp/responses/${responseId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete a document
  deleteDocument: async (documentId: string): Promise<void> => {
    await apiClient.delete(`/documents/${documentId}`);
  },
};
