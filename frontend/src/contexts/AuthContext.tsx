import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, AuthUser, UserPermissions } from '@/types/permissions';
import { createPermissionHelpers } from '@/utils/permissions';

// Action types
type AuthAction =
  | { type: 'LOGIN'; payload: { user: AuthUser; permissions: UserPermissions; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'INITIALIZE' };

// Initial state
const initialState: AuthState = {
  user: null,
  permissions: null,
  token: null,
  isAuthenticated: false,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        permissions: action.payload.permissions,
        token: action.payload.token,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        permissions: null,
        token: null,
        isAuthenticated: false,
      };
    case 'INITIALIZE':
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const permissionsStr = localStorage.getItem('permissions');
      
      if (token && userStr && permissionsStr) {
        try {
          const user = JSON.parse(userStr);
          const permissions = JSON.parse(permissionsStr);
          return {
            ...state,
            user,
            permissions,
            token,
            isAuthenticated: true,
          };
        } catch (error) {
          console.error('Error parsing stored auth data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('permissions');
          return initialState;
        }
      }
      return initialState;
    default:
      return state;
  }
};

// Context
interface AuthContextType extends AuthState {
  login: (user: AuthUser, permissions: UserPermissions, token: string) => void;
  logout: () => void;
  permissionHelpers: ReturnType<typeof createPermissionHelpers>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    dispatch({ type: 'INITIALIZE' });
  }, []);

  // Login function
  const login = (user: AuthUser, permissions: UserPermissions, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('permissions', JSON.stringify(permissions));
    dispatch({ type: 'LOGIN', payload: { user, permissions, token } });
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    dispatch({ type: 'LOGOUT' });
  };

  // Create permission helpers
  const permissionHelpers = createPermissionHelpers(state.permissions);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    permissionHelpers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
