// Permission types based on backend structure

export interface Permission {
  allowed: boolean;
  scope?: 'own' | 'rfp_owner' | 'published';
  allowed_rfp_statuses?: string[];
  allowed_response_statuses?: string[];
  allowed_transitions?: Record<string, string[]>;
}

export interface ResourcePermissions {
  [action: string]: Permission;
}

export interface UserPermissions {
  dashboard?: ResourcePermissions;
  rfp?: ResourcePermissions;
  supplier_response?: ResourcePermissions;
  documents?: ResourcePermissions;
  search?: ResourcePermissions;
  admin?: ResourcePermissions;
}

export interface AuthUser {
  id: string;
  email: string;
  role_id: string;
  role: string;
}

export interface AuthState {
  user: AuthUser | null;
  permissions: UserPermissions | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
