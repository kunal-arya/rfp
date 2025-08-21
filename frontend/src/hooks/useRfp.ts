import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rfpApi, CreateRfpData, UpdateRfpData, RfpFilters } from '@/apis/rfp';
import { useNavigate } from 'react-router-dom';

export const useAllRfps = (filters?: RfpFilters) => {
  return useQuery({
    queryKey: ['rfps', 'all', filters],
    queryFn: () => rfpApi.getAllRfps(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useMyRfps = (filters?: RfpFilters) => {
  return useQuery({
    queryKey: ['rfps', 'my', filters],
    queryFn: () => rfpApi.getMyRfps(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRfpById = (rfpId: string) => {
  return useQuery({
    queryKey: ['rfp', rfpId],
    queryFn: () => rfpApi.getRfpById(rfpId),
    enabled: !!rfpId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateRfp = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: CreateRfpData) => rfpApi.createRfp(data),
    onSuccess: (newRfp) => {
      // Invalidate and refetch RFPs
      queryClient.invalidateQueries({ queryKey: ['rfps', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Navigate to the new RFP
      navigate(`/rfps/${newRfp.id}`);
    },
    onError: (error) => {
      console.error('Failed to create RFP:', error);
    },
  });
};

export const useUpdateRfp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rfpId, data }: { rfpId: string; data: UpdateRfpData }) =>
      rfpApi.updateRfp(rfpId, data),
    onSuccess: (updatedRfp) => {
      // Update the specific RFP in cache
      queryClient.setQueryData(['rfp', updatedRfp.id], updatedRfp);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['rfps', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['rfps', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      console.error('Failed to update RFP:', error);
    },
  });
};

export const useDeleteRfp = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (rfpId: string) => rfpApi.deleteRfp(rfpId),
    onSuccess: (_, rfpId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['rfp', rfpId] });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['rfps', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Navigate back to RFPs list
      navigate('/rfps');
    },
    onError: (error) => {
      console.error('Failed to delete RFP:', error);
    },
  });
};

export const usePublishRfp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rfpId: string) => rfpApi.publishRfp(rfpId),
    onSuccess: (publishedRfp) => {
      // Update the specific RFP in cache
      queryClient.setQueryData(['rfp', publishedRfp.id], publishedRfp);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['rfps', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['rfps', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      console.error('Failed to publish RFP:', error);
    },
  });
};
