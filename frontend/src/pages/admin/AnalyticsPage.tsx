import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  FileText,
  MessageSquare,
  Calendar,
  DollarSign,
  Loader2,
  Award,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';

const AnalyticsPage: React.FC = () => {
  // Use real analytics API data
  const { data: analyticsData, isLoading, error } = useAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load analytics data</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const data = analyticsData?.data || {
    totalRfps: 0,
    totalResponses: 0,
    newRfpsThisMonth: 0,
    newResponsesThisMonth: 0,
    monthlyGrowthData: [],
    rfpStatusDistribution: [],
    responseMetrics: {},
    systemMetrics: {},
    topPerformingBuyers: [],
    topPerformingSuppliers: [],
    rfpCategoryDistribution: [],
    responseTimeMetrics: []
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Business intelligence and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total RFPs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalRfps?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{data.newRfpsThisMonth || 0}</span> this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalResponses?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{data.newResponsesThisMonth || 0}</span> this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.responseMetrics?.responseRate || '0%'}</div>
            <p className="text-xs text-muted-foreground">
              RFPs with responses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.responseMetrics?.successRate || '0%'}</div>
            <p className="text-xs text-muted-foreground">
              RFPs awarded
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.monthlyGrowthData?.map((monthData, index) => (
                <div key={monthData.month} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 text-sm font-medium">{monthData.month}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 text-xs text-muted-foreground">Users</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min((monthData.users / 50) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <div className="w-12 text-xs text-right">{monthData.users}</div>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-16 text-xs text-muted-foreground">RFPs</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${Math.min((monthData.rfps / 20) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <div className="w-12 text-xs text-right">{monthData.rfps}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* RFP Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>RFP Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.rfpStatusDistribution?.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium">{item.status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Response Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Response Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{data.responseMetrics?.avgResponseTime || 'N/A'}</div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{data.responseMetrics?.responseRate || '0%'}</div>
              <div className="text-sm text-muted-foreground">Response Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{data.responseMetrics?.successRate || '0%'}</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{data.responseMetrics?.avgResponsesPerRfp || '0'}</div>
              <div className="text-sm text-muted-foreground">Avg Responses per RFP</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers & System Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Buyers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Buyers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topPerformingBuyers?.map((buyer, index) => (
                <div key={buyer.email} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium">{buyer.name}</div>
                      <div className="text-xs text-muted-foreground">{buyer.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{buyer.rfpsCreated}</div>
                    <div className="text-xs text-muted-foreground">RFPs</div>
                  </div>
                </div>
              ))}
              {(!data.topPerformingBuyers || data.topPerformingBuyers.length === 0) && (
                <div className="text-center text-muted-foreground py-4">
                  No buyer data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Suppliers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topPerformingSuppliers?.map((supplier, index) => (
                <div key={supplier.email} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-600">{index + 1}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium">{supplier.name}</div>
                      <div className="text-xs text-muted-foreground">{supplier.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{supplier.responsesSubmitted}</div>
                    <div className="text-xs text-muted-foreground">Responses</div>
                  </div>
                </div>
              ))}
              {(!data.topPerformingSuppliers || data.topPerformingSuppliers.length === 0) && (
                <div className="text-center text-muted-foreground py-4">
                  No supplier data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Performance & Response Time Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Performance */}
        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Logins (This Week)</span>
                <span className="text-sm font-medium">{data.systemMetrics?.totalLogins || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Error Rate</span>
                <span className="text-sm font-medium text-red-600">{data.systemMetrics?.errorRate || '0'}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg Session Duration</span>
                <span className="text-sm font-medium">{data.systemMetrics?.avgSessionDuration || 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response Time Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Response Time Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.responseTimeMetrics?.map((metric) => (
                <div key={metric.time_range} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-sm">{metric.time_range}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${Math.min((metric.count / 10) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {metric.count}
                    </span>
                  </div>
                </div>
              ))}
              {(!data.responseTimeMetrics || data.responseTimeMetrics.length === 0) && (
                <div className="text-center text-muted-foreground py-4">
                  No response time data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RFP Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>RFP Category Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {data.rfpCategoryDistribution?.map((category) => (
              <div key={category.category} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{category.count}</div>
                <div className="text-sm font-medium">{category.category}</div>
                <div className="text-xs text-muted-foreground">{category.percentage}%</div>
              </div>
            ))}
            {(!data.rfpCategoryDistribution || data.rfpCategoryDistribution.length === 0) && (
              <div className="col-span-full text-center text-muted-foreground py-4">
                No category data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
