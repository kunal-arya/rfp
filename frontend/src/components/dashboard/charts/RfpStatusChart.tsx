'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RfpStatusChartProps {
  stats: {
    draftRfps?: number;
    publishedRfps?: number;
    closedRfps?: number;
    awardedRfps?: number;
    cancelledRfps?: number;
    pendingResponses?: number; // Representing 'Under Review'
    approvedResponses?: number;
    rejectedResponses?: number;
    awardedResponses?: number;
  };
}

export const RfpStatusChart: React.FC<RfpStatusChartProps> = ({ stats }) => {
  const data = [
    { name: 'Draft', count: stats.draftRfps || 0 },
    { name: 'Published', count: stats.publishedRfps || 0 },
    { name: 'Closed', count: stats.closedRfps || 0 },
    { name: 'Awarded', count: stats.awardedRfps || 0 },
    { name: 'Cancelled', count: stats.cancelledRfps || 0 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>RFP Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
              }}
            />
            <Legend />
            <Bar dataKey="count" fill="#3b82f6" name="Number of RFPs" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
