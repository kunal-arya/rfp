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

      login(user, permissions, response.token);
      navigate('/dashboard');
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
};
