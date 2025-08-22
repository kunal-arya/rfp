import apiClient from './client';
import { RFP, PaginatedResponse } from './types';

export interface CreateRfpData {
  title: string;
  description: string;
  requirements: string;
  budget_min?: number;
  budget_max?: number;
  deadline: string;
  notes?: string;
}

export interface UpdateRfpData extends Partial<CreateRfpData> {}

export interface RfpFilters {
  status?: string;
  search?: string;
  budget_min?: number;
  budget_max?: number;
  deadline_from?: string;
  deadline_to?: string;
  page?: number;
  limit?: number;
}

export const rfpApi = {
  // Get all RFPs (for suppliers - published only)
  getAllRfps: async (filters?: RfpFilters): Promise<PaginatedResponse<RFP>> => {
    const response = await apiClient.get<PaginatedResponse<RFP>>('/rfp/all', { params: filters });
    return response.data;
  },

  // Get user's own RFPs (for buyers)
  getMyRfps: async (filters?: RfpFilters): Promise<PaginatedResponse<RFP>> => {
    const response = await apiClient.get<PaginatedResponse<RFP>>('/rfp', { params: filters });
    return response.data;
  },

  // Get specific RFP by ID
  getRfpById: async (rfpId: string): Promise<RFP> => {
    const response = await apiClient.get<RFP>(`/rfp/${rfpId}`);
    return response.data;
  },

  // Create new RFP
  createRfp: async (data: CreateRfpData): Promise<RFP> => {
    const response = await apiClient.post<RFP>('/rfp', data);
    return response.data;
  },

  // Update RFP
  updateRfp: async (rfpId: string, data: UpdateRfpData): Promise<RFP> => {
    const response = await apiClient.put<RFP>(`/rfp/${rfpId}`, data);
    return response.data;
  },

  // Delete RFP
  deleteRfp: async (rfpId: string): Promise<void> => {
    await apiClient.delete(`/rfp/${rfpId}`);
  },

  // Publish RFP
  publishRfp: async (rfpId: string): Promise<RFP> => {
    const response = await apiClient.put<RFP>(`/rfp/${rfpId}/publish`);
    return response.data;
  },

  // Close RFP
  closeRfp: async (rfpId: string): Promise<RFP> => {
    const response = await apiClient.put<RFP>(`/rfp/${rfpId}/close`);
    return response.data;
  },

  // Cancel RFP
  cancelRfp: async (rfpId: string): Promise<RFP> => {
    const response = await apiClient.put<RFP>(`/rfp/${rfpId}/cancel`);
    return response.data;
  },

  // Award RFP to a response
  awardRfp: async (rfpId: string, responseId: string): Promise<RFP> => {
    const response = await apiClient.put<RFP>(`/rfp/${rfpId}/award`, { response_id: responseId });
    return response.data;
  },
};
