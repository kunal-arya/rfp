import { UserPermissions, Permission } from '@/types/permissions';

// Check if user has permission for a specific resource and action
export const hasPermission = (
  permissions: UserPermissions | null,
  resource: string,
  action: string
): boolean => {
  if (!permissions) return false;
  
  const resourcePermissions = permissions[resource as keyof UserPermissions];
  if (!resourcePermissions) return false;
  
  const permission = resourcePermissions[action];
  if (!permission) return false;
  
  return permission.allowed;
};

// Helper functions for common permission checks
export const createPermissionHelpers = (permissions: UserPermissions | null) => ({
  // Dashboard permissions
  canViewDashboard: hasPermission(permissions, 'dashboard', 'view'),
  
  // RFP permissions
  canCreateRfp: hasPermission(permissions, 'rfp', 'create'),
  canViewRfp: hasPermission(permissions, 'rfp', 'view'),
  canEditRfp: hasPermission(permissions, 'rfp', 'edit'),
  canPublishRfp: hasPermission(permissions, 'rfp', 'publish'),
  canReviewResponses: hasPermission(permissions, 'rfp', 'review_responses'),
  canReadResponses: hasPermission(permissions, 'rfp', 'read_responses'),
  canManageRfpDocuments: hasPermission(permissions, 'rfp', 'manage_documents'),
  canChangeRfpStatus: hasPermission(permissions, 'rfp', 'change_status'),
  
  // Supplier Response permissions
  canCreateResponse: hasPermission(permissions, 'supplier_response', 'create'),
  canSubmitResponse: hasPermission(permissions, 'supplier_response', 'submit'),
  canViewResponse: hasPermission(permissions, 'supplier_response', 'view'),
  canEditResponse: hasPermission(permissions, 'supplier_response', 'edit'),
  canManageResponseDocuments: hasPermission(permissions, 'supplier_response', 'manage_documents'),
  canReviewResponse: hasPermission(permissions, 'supplier_response', 'review'),
  
  // Document permissions
  canUploadRfpDocuments: hasPermission(permissions, 'documents', 'upload_for_rfp'),
  canUploadResponseDocuments: hasPermission(permissions, 'documents', 'upload_for_response'),
  
  // Search permissions
  canSearch: hasPermission(permissions, 'search', 'allowed'),
  
  // Admin permissions
  canManageUsers: hasPermission(permissions, 'admin', 'manage_users'),
  canManageRoles: hasPermission(permissions, 'admin', 'manage_roles'),
  
  // Generic permission checker
  hasPermission: (resource: string, action: string) => hasPermission(permissions, resource, action),
});

// Check if permission has specific scope
export const hasScope = (permission: Permission, scope: string): boolean => {
  return permission.scope === scope;
};

// Check if RFP status is allowed for action
export const isRfpStatusAllowed = (
  permission: Permission,
  status: string
): boolean => {
  if (!permission.allowed_rfp_statuses) return true;
  return permission.allowed_rfp_statuses.includes(status);
};

// Check if response status is allowed for action
export const isResponseStatusAllowed = (
  permission: Permission,
  status: string
): boolean => {
  if (!permission.allowed_response_statuses) return true;
  return permission.allowed_response_statuses.includes(status);
};
