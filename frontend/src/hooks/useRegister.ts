import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi, RegisterData } from '@/apis/auth';
import { useAuth } from '@/contexts/AuthContext';

export const useRegister = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (response) => {
      // Extract user and permissions from JWT payload
      const user = {
        id: response.user.id,
        email: response.user.email,
        role: 'Buyer', // This should come from the backend response
      };

      // For now, we'll use default permissions based on role
      // In a real app, these would come from the backend
      const permissions = user.role === 'Buyer' ? {
        dashboard: { view: { allowed: true } },
        rfp: {
          create: { allowed: true },
          view: { allowed: true, scope: 'own' },
          edit: { allowed: true, scope: 'own', allowed_rfp_statuses: ['Draft'] },
          publish: { allowed: true, scope: 'own', allowed_rfp_statuses: ['Draft'] },
          review_responses: { allowed: true, scope: 'own' },
          read_responses: { allowed: true, scope: 'own' },
          manage_documents: { allowed: true, scope: 'own' },
          change_status: { allowed: true, scope: 'own', allowed_transitions: { "Under Review": ['Approved', 'Rejected'] } }
        },
        supplier_response: {
          submit: { allowed: false },
          view: { allowed: true, scope: 'rfp_owner' },
          edit: { allowed: false },
          create: { allowed: false },
          manage_documents: { allowed: false },
          review: { allowed: true, scope: 'rfp_owner' },
        },
        documents: {
          upload_for_rfp: { allowed: true, scope: 'own' },
          upload_for_response: { allowed: false }
        },
        search: { allowed: { allowed: true } },
        admin: { manage_users: { allowed: false }, manage_roles: { allowed: false } }
      } : {
        dashboard: { view: { allowed: true } },
        rfp: {
          create: { allowed: false },
          view: { allowed: true, scope: 'published' as const },
          edit: { allowed: false },
          read_responses: { allowed: false },
          publish: { allowed: false },
          review_responses: { allowed: false },
          manage_documents: { allowed: false },
          change_status: { allowed: false },
        },
        supplier_response: {
          create: { allowed: true, allowed_rfp_statuses: ['Published'] },
          submit: { allowed: true, scope: 'own' as const, allowed_response_statuses: ['Draft'] },
          view: { allowed: true, scope: 'own' as const },
          edit: { allowed: true, scope: 'own' as const, allowed_response_statuses: ['Draft'] },
          manage_documents: { allowed: true, scope: 'own' as const },
          review: { allowed: false },
        },
        documents: {
          upload_for_rfp: { allowed: false },
          upload_for_response: { allowed: true, scope: 'own' as const },
        },
        search: { allowed: { allowed: true } },
        admin: {
          manage_users: { allowed: false },
          manage_roles: { allowed: false },
        },
      };

      login(user, permissions, response.token);
      navigate('/dashboard');
    },
    onError: (error) => {
      console.error('Registration failed:', error);
    },
  });
};
