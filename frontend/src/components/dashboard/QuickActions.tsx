import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, FileText, Users, Upload, Settings, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const QuickActions: React.FC = () => {
  const { permissionHelpers } = useAuth();
  const navigate = useNavigate();

  const buyerActions = [
    {
      title: 'Create RFP',
      description: 'Create a new Request for Proposal',
      icon: Plus,
      action: () => navigate('/rfps/create'),
      permission: permissionHelpers.canCreateRfp,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'View My RFPs',
      description: 'Manage your existing RFPs',
      icon: FileText,
      action: () => navigate('/rfps/my'),
      permission: permissionHelpers.canViewRfp,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'Review Responses',
      description: 'Review responses to your RFPs',
      icon: MessageSquare,
      action: () => navigate('/responses/review'),
      permission: permissionHelpers.canReviewResponses,
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      title: 'Review Responses',
      description: 'Review responses to your RFPs',
      icon: Users,
      action: () => console.log('Review Responses'),
      permission: permissionHelpers.canReviewResponses,
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      title: 'Upload Documents',
      description: 'Upload documents for your RFPs',
      icon: Upload,
      action: () => console.log('Upload Documents'),
      permission: permissionHelpers.canUploadRfpDocuments,
      color: 'bg-orange-500 hover:bg-orange-600',
    },
  ];

  const supplierActions = [
    {
      title: 'Browse RFPs',
      description: 'Find RFPs to respond to',
      icon: Search,
      action: () => navigate('/rfps/browse'),
      permission: permissionHelpers.canSearch,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'My Responses',
      description: 'Manage your responses to RFPs',
      icon: MessageSquare,
      action: () => navigate('/responses/my'),
      permission: permissionHelpers.canViewResponse,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'My Responses',
      description: 'View and manage your responses',
      icon: FileText,
      action: () => console.log('My Responses'),
      permission: permissionHelpers.canViewResponse,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'Create Response',
      description: 'Submit a new response',
      icon: Plus,
      action: () => console.log('Create Response'),
      permission: permissionHelpers.canCreateResponse,
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      title: 'Upload Documents',
      description: 'Upload documents for responses',
      icon: Upload,
      action: () => console.log('Upload Documents'),
      permission: permissionHelpers.canUploadResponseDocuments,
      color: 'bg-orange-500 hover:bg-orange-600',
    },
  ];

  const actions = permissionHelpers.canCreateRfp ? buyerActions : supplierActions;
  const filteredActions = actions.filter(action => action.permission);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="h-5 w-5 text-gray-600" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Common actions you can perform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                onClick={action.action}
                className={`${action.color} text-white h-auto p-4 flex flex-col items-center gap-2 transition-all duration-200 hover:scale-105`}
              >
                <Icon className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs opacity-90">{action.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
