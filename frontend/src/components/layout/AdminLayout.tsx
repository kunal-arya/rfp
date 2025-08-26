import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  BarChart3, 
  Shield, 
  Settings, 
  FileText, 
  MessageSquare, 
  Folder, 
  Activity,
  LogOut,
  Home,
  Bell,
  HelpCircle
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { user, logout, permissionHelpers } = useAuth();
  const location = useLocation();

  // Navigation configuration
  const navigationConfig = {
    dashboard: { name: 'Dashboard', href: '/admin', icon: Home },
    users: { name: 'Users', href: '/admin/users', icon: Users },
    analytics: { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    audit: { name: 'Audit Logs', href: '/admin/audit', icon: Shield },
    rfps: { name: 'RFPs', href: '/admin/rfps', icon: FileText },
    responses: { name: 'Responses', href: '/admin/responses', icon: MessageSquare },
    reports: { name: 'Reports', href: '/admin/reports', icon: Activity },
    notifications: { name: 'Notifications', href: '/admin/notifications', icon: Bell },
    documents: { name: 'Documents', href: '/admin/documents', icon: Folder },
    support: { name: 'Support', href: '/admin/support', icon: HelpCircle },
    settings: { name: 'Settings', href: '/admin/settings', icon: Settings },
  };

  // Get allowed pages from permissions
  const allowedPages = permissionHelpers.getNavbarPages();
  
  // Build navigation based on allowed pages
  const navigation = allowedPages
    .map(page => navigationConfig[page as keyof typeof navigationConfig])
    .filter(Boolean);

    console.log(allowedPages);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center justify-between px-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        </div>
        
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User info and logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              {navigation.find(item => item.href === location.pathname)?.name || 'Admin Panel'}
            </h2>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
