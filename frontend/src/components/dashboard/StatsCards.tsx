import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from '@/apis/types';
import { FileText, Users, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';

interface StatsCardsProps {
  stats: DashboardStats;
  role: string;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, role }) => {
  const isBuyer = role === 'Buyer';

  const buyerStats = [
    {
      title: 'Total RFPs',
      value: stats.totalRfps || 0,
      description: 'RFPs created',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Published RFPs',
      value: stats.publishedRfps || 0,
      description: 'Active RFPs',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Responses',
      value: stats.totalResponses || 0,
      description: 'Received responses',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Pending Review',
      value: stats.pendingResponses || 0,
      description: 'Awaiting review',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const supplierStats = [
    {
      title: 'Available RFPs',
      value: stats.availableRfps || 0,
      description: 'Open for responses',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'My Responses',
      value: stats.totalResponses || 0,
      description: 'Submitted responses',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Approved',
      value: stats.approvedResponses || 0,
      description: 'Successful responses',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Rejected',
      value: stats.rejectedResponses || 0,
      description: 'Unsuccessful responses',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  const currentStats = isBuyer ? buyerStats : supplierStats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {currentStats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
