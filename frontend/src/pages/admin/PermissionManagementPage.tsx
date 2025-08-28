import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useAllRoles, useRolePermissions, useUpdateRolePermissions } from '@/hooks/useAdmin';
import { UserPermissions } from '@/types/permissions';
import { Loader2, Save, RotateCcw, Shield, Users, FileText, MessageSquare, Database, BarChart3, Settings, Key } from 'lucide-react';

interface PermissionSection {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  permissions: {
    key: string;
    label: string;
    description: string;
    type: 'boolean' | 'object';
    subPermissions?: {
      key: string;
      label: string;
      description: string;
    }[];
  }[];
}

const permissionSections: PermissionSection[] = [
  {
    title: 'Dashboard',
    description: 'Access to dashboard and overview pages',
    icon: BarChart3,
    permissions: [
      {
        key: 'dashboard',
        label: 'View Dashboard',
        description: 'Access to main dashboard',
        type: 'boolean'
      }
    ]
  },
  {
    title: 'RFP Management',
    description: 'Create, edit, and manage RFPs',
    icon: FileText,
    permissions: [
      {
        key: 'rfp.create',
        label: 'Create RFP',
        description: 'Create new RFPs',
        type: 'boolean'
      },
      {
        key: 'rfp.view',
        label: 'View RFP',
        description: 'View RFPs',
        type: 'boolean'
      },
      {
        key: 'rfp.edit',
        label: 'Edit RFP',
        description: 'Edit existing RFPs',
        type: 'boolean'
      },
      {
        key: 'rfp.publish',
        label: 'Publish RFP',
        description: 'Publish RFPs',
        type: 'boolean'
      },
      {
        key: 'rfp.close',
        label: 'Close RFP',
        description: 'Close RFPs',
        type: 'boolean'
      },
      {
        key: 'rfp.pause',
        label: 'Pause RFP',
        description: 'Pause RFPs',
        type: 'boolean'
      },
      {
        key: 'rfp.resume',
        label: 'Resume RFP',
        description: 'Resume paused RFPs',
        type: 'boolean'
      },
      {
        key: 'rfp.cancel',
        label: 'Cancel RFP',
        description: 'Cancel RFPs',
        type: 'boolean'
      },
      {
        key: 'rfp.award',
        label: 'Award RFP',
        description: 'Award RFPs to suppliers',
        type: 'boolean'
      },
      {
        key: 'rfp.review_responses',
        label: 'Review Responses',
        description: 'Review supplier responses',
        type: 'boolean'
      },
      {
        key: 'rfp.read_responses',
        label: 'Read Responses',
        description: 'Read supplier responses',
        type: 'boolean'
      },
      {
        key: 'rfp.manage_documents',
        label: 'Manage Documents',
        description: 'Manage RFP documents',
        type: 'boolean'
      }
    ]
  },
  {
    title: 'Supplier Responses',
    description: 'Manage supplier responses to RFPs',
    icon: MessageSquare,
    permissions: [
      {
        key: 'supplier_response.create',
        label: 'Create Response',
        description: 'Create responses to RFPs',
        type: 'boolean'
      },
      {
        key: 'supplier_response.submit',
        label: 'Submit Response',
        description: 'Submit responses',
        type: 'boolean'
      },
      {
        key: 'supplier_response.view',
        label: 'View Response',
        description: 'View responses',
        type: 'boolean'
      },
      {
        key: 'supplier_response.edit',
        label: 'Edit Response',
        description: 'Edit responses',
        type: 'boolean'
      },
      {
        key: 'supplier_response.manage_documents',
        label: 'Manage Documents',
        description: 'Manage response documents',
        type: 'boolean'
      },
      {
        key: 'supplier_response.review',
        label: 'Review Response',
        description: 'Review responses',
        type: 'boolean'
      },
      {
        key: 'supplier_response.approve',
        label: 'Approve Response',
        description: 'Approve responses',
        type: 'boolean'
      },
      {
        key: 'supplier_response.reject',
        label: 'Reject Response',
        description: 'Reject responses',
        type: 'boolean'
      },
      {
        key: 'supplier_response.award',
        label: 'Award Response',
        description: 'Award responses',
        type: 'boolean'
      },
      {
        key: 'supplier_response.reopen',
        label: 'Reopen Response',
        description: 'Reopen rejected responses for editing',
        type: 'boolean'
      }
    ]
  },
  {
    title: 'Documents',
    description: 'Upload and manage documents',
    icon: Database,
    permissions: [
      {
        key: 'documents.upload_for_rfp',
        label: 'Upload for RFP',
        description: 'Upload documents for RFPs',
        type: 'boolean'
      },
      {
        key: 'documents.upload_for_response',
        label: 'Upload for Response',
        description: 'Upload documents for responses',
        type: 'boolean'
      }
    ]
  },
  {
    title: 'Search',
    description: 'Search functionality',
    icon: Settings,
    permissions: [
      {
        key: 'search',
        label: 'Search',
        description: 'Use search functionality',
        type: 'boolean'
      }
    ]
  },
  {
    title: 'Audit',
    description: 'View audit logs',
    icon: Shield,
    permissions: [
      {
        key: 'audit.view',
        label: 'View Audit Logs',
        description: 'View audit trail',
        type: 'boolean'
      }
    ]
  },
  {
    title: 'Admin',
    description: 'Administrative functions',
    icon: Users,
    permissions: [
      {
        key: 'admin.manage_users',
        label: 'Manage Users',
        description: 'Create, edit, and manage users',
        type: 'boolean'
      },
      {
        key: 'admin.manage_roles',
        label: 'Manage Roles',
        description: 'Manage role permissions',
        type: 'boolean'
      },
      {
        key: 'admin.view_analytics',
        label: 'View Analytics',
        description: 'Access analytics and reports',
        type: 'boolean'
      },
      {
        key: 'admin.system_config',
        label: 'System Configuration',
        description: 'Configure system settings',
        type: 'boolean'
      },
      {
        key: 'admin.export_data',
        label: 'Export Data',
        description: 'Export system data',
        type: 'boolean'
      }
    ]
  }
];

export const PermissionManagementPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [hasChanges, setHasChanges] = useState(false);


  const { data: roles, isLoading: rolesLoading } = useAllRoles();
  const { data: rolePermissions, isLoading: permissionsLoading } = useRolePermissions(selectedRole);
  const updatePermissionsMutation = useUpdateRolePermissions();

  useEffect(() => {
    if (roles && roles.length > 0 && !selectedRole) {
      setSelectedRole(roles[0].name);
    }
  }, [roles, selectedRole]);

  useEffect(() => {
    if (rolePermissions) {
      setPermissions(rolePermissions);
      setHasChanges(false);
    }
  }, [rolePermissions]);

  const handlePermissionChange = (path: string, value: boolean) => {
    if (!permissions) return;

    const pathParts = path.split('.');
    let current: any = permissions;

    // Navigate to the parent object
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        current[pathParts[i]] = {};
      }
      current = current[pathParts[i]];
    }

    // Set the final value
    const lastKey = pathParts[pathParts.length - 1];
    if (typeof current[lastKey] === 'object' && current[lastKey] !== null) {
      current[lastKey].allowed = value;
    } else {
      current[lastKey] = value;
    }

    setPermissions({ ...permissions });
    setHasChanges(true);
  };

  const getPermissionValue = (path: string): boolean => {
    if (!permissions) return false;

    const pathParts = path.split('.');
    let current: any = permissions;

    for (const part of pathParts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return false;
      }
    }

    if (typeof current === 'object' && current !== null) {
      return current.allowed || false;
    }

    return Boolean(current);
  };

  const handleSave = async () => {
    if (!permissions || !selectedRole) return;

    try {
      await updatePermissionsMutation.mutateAsync({
        roleName: selectedRole,
        permissions
      });

      toast.success(`Permissions for ${selectedRole} role have been updated successfully.`);

      setHasChanges(false);
    } catch {
      toast.error('Failed to update permissions. Please try again.');
    }
  };

  const handleReset = () => {
    if (rolePermissions) {
      setPermissions(rolePermissions);
      setHasChanges(false);
    }
  };

  const isAdminRole = selectedRole === 'Admin';

  if (rolesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permission Management</h1>
          <p className="text-muted-foreground">
            Manage role-based permissions for users across the system
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              Unsaved Changes
            </Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Selection</CardTitle>
          <CardDescription>
            Select a role to manage its permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles?.map((role) => (
                  <SelectItem key={role.name} value={role.name}>
                    <div className="flex items-center gap-2">
                      {role.name === 'Admin' && <Shield className="h-4 w-4" />}
                      {role.name === 'Buyer' && <Users className="h-4 w-4" />}
                      {role.name === 'Supplier' && <FileText className="h-4 w-4" />}
                      {role.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isAdminRole && (
              <Alert className="w-96">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Admin role permissions are read-only for security reasons.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {isAdminRole ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Role Permissions
            </CardTitle>
            <CardDescription>
              Admin role has full system access and cannot be modified
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {permissionSections.map((section) => (
                <div key={section.title} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <section.icon className="h-4 w-4 text-blue-600" />
                    <h3 className="font-semibold">{section.title}</h3>
                  </div>
                  <div className="space-y-2">
                    {section.permissions.map((permission) => (
                      <div key={permission.key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium">{permission.label}</p>
                          <p className="text-xs text-gray-500">{permission.description}</p>
                        </div>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Enabled
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {permissionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  {selectedRole} Role Permissions
                </CardTitle>
                <CardDescription>
                  Configure permissions for the {selectedRole} role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                    <TabsTrigger value="all">All Permissions</TabsTrigger>
                    <TabsTrigger value="rfp">RFP Management</TabsTrigger>
                    <TabsTrigger value="responses">Responses</TabsTrigger>
                    <TabsTrigger value="admin">Admin</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-6">
                    {permissionSections.map((section) => (
                      <div key={section.title}>
                        <div className="flex items-center gap-2 mb-4">
                          <section.icon className="h-5 w-5 text-blue-600" />
                          <h3 className="text-lg font-semibold">{section.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{section.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {section.permissions.map((permission) => (
                            <div key={permission.key} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="space-y-1">
                                <Label htmlFor={permission.key} className="text-sm font-medium">
                                  {permission.label}
                                </Label>
                                <p className="text-xs text-gray-500">{permission.description}</p>
                              </div>
                              <Switch
                                id={permission.key}
                                checked={getPermissionValue(permission.key)}
                                onCheckedChange={(checked) => handlePermissionChange(permission.key, checked)}
                                disabled={isAdminRole}
                              />
                            </div>
                          ))}
                        </div>
                        <Separator className="mt-6" />
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="rfp" className="space-y-6">
                    {permissionSections
                      .filter(section => ['RFP Management', 'Documents'].includes(section.title))
                      .map((section) => (
                        <div key={section.title}>
                          <div className="flex items-center gap-2 mb-4">
                            <section.icon className="h-5 w-5 text-blue-600" />
                            <h3 className="text-lg font-semibold">{section.title}</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">{section.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {section.permissions.map((permission) => (
                              <div key={permission.key} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-1">
                                  <Label htmlFor={permission.key} className="text-sm font-medium">
                                    {permission.label}
                                  </Label>
                                  <p className="text-xs text-gray-500">{permission.description}</p>
                                </div>
                                <Switch
                                  id={permission.key}
                                  checked={getPermissionValue(permission.key)}
                                  onCheckedChange={(checked) => handlePermissionChange(permission.key, checked)}
                                  disabled={isAdminRole}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </TabsContent>

                  <TabsContent value="responses" className="space-y-6">
                    {permissionSections
                      .filter(section => ['Supplier Responses'].includes(section.title))
                      .map((section) => (
                        <div key={section.title}>
                          <div className="flex items-center gap-2 mb-4">
                            <section.icon className="h-5 w-5 text-blue-600" />
                            <h3 className="text-lg font-semibold">{section.title}</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">{section.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {section.permissions.map((permission) => (
                              <div key={permission.key} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-1">
                                  <Label htmlFor={permission.key} className="text-sm font-medium">
                                    {permission.label}
                                  </Label>
                                  <p className="text-xs text-gray-500">{permission.description}</p>
                                </div>
                                <Switch
                                  id={permission.key}
                                  checked={getPermissionValue(permission.key)}
                                  onCheckedChange={(checked) => handlePermissionChange(permission.key, checked)}
                                  disabled={isAdminRole}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </TabsContent>

                  <TabsContent value="admin" className="space-y-6">
                    {permissionSections
                      .filter(section => ['Admin'].includes(section.title))
                      .map((section) => (
                        <div key={section.title}>
                          <div className="flex items-center gap-2 mb-4">
                            <section.icon className="h-5 w-5 text-blue-600" />
                            <h3 className="text-lg font-semibold">{section.title}</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">{section.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {section.permissions.map((permission) => (
                              <div key={permission.key} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-1">
                                  <Label htmlFor={permission.key} className="text-sm font-medium">
                                    {permission.label}
                                  </Label>
                                  <p className="text-xs text-gray-500">{permission.description}</p>
                                </div>
                                <Switch
                                  id={permission.key}
                                  checked={getPermissionValue(permission.key)}
                                  onCheckedChange={(checked) => handlePermissionChange(permission.key, checked)}
                                  disabled={isAdminRole}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </TabsContent>
                </Tabs>

                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <div className="flex items-center gap-2">
                    {hasChanges && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Unsaved Changes
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      disabled={!hasChanges || isAdminRole}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={!hasChanges || isAdminRole || updatePermissionsMutation.isPending}
                    >
                      {updatePermissionsMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
