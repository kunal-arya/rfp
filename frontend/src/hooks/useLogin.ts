import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi, LoginData } from '@/apis/auth';
import { useAuth } from '@/contexts/AuthContext';

export const useLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  return useMutation({
    mutationFn: (data: LoginData) => authApi.login(data),
    onSuccess: (response) => {
      // Extract user and permissions from JWT payload
      // Note: In a real app, you might want to decode the JWT to get user info
      // For now, we'll use the response structure from our API
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
          view: { allowed: true, scope: 'own' as const },
          edit: { allowed: true, scope: 'own' as const, allowed_rfp_statuses: ['Draft'] },
          publish: { allowed: true, scope: 'own' as const, allowed_rfp_statuses: ['Draft'] },
          review_responses: { allowed: true, scope: 'own' as const },
          read_responses: { allowed: true, scope: 'own' as const },
          manage_documents: { allowed: true, scope: 'own' as const },
          change_status: { allowed: true, scope: 'own' as const, allowed_transitions: { "Under Review": ['Approved', 'Rejected'] } }
        },
        supplier_response: {
          submit: { allowed: false },
          view: { allowed: true, scope: 'rfp_owner' as const },
          edit: { allowed: false },
          create: { allowed: false },
          manage_documents: { allowed: false },
          review: { allowed: true, scope: 'rfp_owner' as const },
        },
        documents: {
          upload_for_rfp: { allowed: true, scope: 'own' as const },
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
      console.error('Login failed:', error);
    },
  });
};
