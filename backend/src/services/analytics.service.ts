import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAnalyticsData = async () => {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalRfps,
    totalResponses,
    newRfpsThisMonth,
    newResponsesThisMonth,
    rfpStatusDistribution,
    monthlyGrowthData,
    responseMetrics,
    systemMetrics,
    topPerformingBuyers,
    topPerformingSuppliers,
    rfpCategoryDistribution,
    responseTimeMetrics
  ] = await Promise.all([
    // Total RFPs
    prisma.rFP.count(),
    
    // Total Responses
    prisma.supplierResponse.count(),
    
    // New RFPs this month
    prisma.rFP.count({
      where: {
        created_at: { gte: lastMonth }
      }
    }),
    
    // New Responses this month
    prisma.supplierResponse.count({
      where: {
        created_at: { gte: lastMonth }
      }
    }),
    
    // RFP Status Distribution with status labels
    prisma.rFP.groupBy({
      by: ['status_id'],
      _count: {
        status_id: true
      }
    }),
    
    // Monthly Growth Data (last 6 months)
    (async () => {
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        const [users, rfps, responses] = await Promise.all([
          prisma.user.count({
            where: {
              created_at: { gte: monthStart, lte: monthEnd }
            }
          }),
          prisma.rFP.count({
            where: {
              created_at: { gte: monthStart, lte: monthEnd }
            }
          }),
          prisma.supplierResponse.count({
            where: {
              created_at: { gte: monthStart, lte: monthEnd }
            }
          })
        ]);
        
        months.push({
          month: monthStart.toLocaleString('default', { month: 'short' }),
          users,
          rfps,
          responses
        });
      }
      return months;
    })(),
    
    // Response Performance Metrics
    (async () => {
      // Get all RFPs with their first response time
      const rfpsWithFirstResponse = await prisma.rFP.findMany({
        where: {
          supplier_responses: {
            some: {}
          }
        },
        include: {
          supplier_responses: {
            orderBy: {
              created_at: 'asc'
            },
            take: 1
          }
        }
      });

      // Calculate average response time
      let totalResponseTime = 0;
      let responseCount = 0;
      
      rfpsWithFirstResponse.forEach(rfp => {
        if (rfp.supplier_responses.length > 0) {
          const responseTime = rfp.supplier_responses[0].created_at.getTime() - rfp.created_at.getTime();
          totalResponseTime += responseTime;
          responseCount++;
        }
      });

      const avgResponseTimeDays = responseCount > 0 ? Math.round((totalResponseTime / (1000 * 60 * 60 * 24)) / responseCount) : 0;
      
      // Response Rate (RFPs with at least one response)
      const rfpsWithResponses = await prisma.rFP.count({
        where: {
          supplier_responses: { some: {} }
        }
      });
      
      // Success Rate (RFPs that have an awarded response)
      const awardedRfps = await prisma.rFP.count({
        where: {
          awarded_response_id: { not: null }
        }
      });

      // Average Responses per RFP
      const rfpResponseCounts = await prisma.rFP.findMany({
        include: {
          _count: {
            select: { supplier_responses: true }
          }
        }
      });

      const totalResponseCount = rfpResponseCounts.reduce((sum, rfp) => sum + rfp._count.supplier_responses, 0);
      const avgResponsesPerRfp = rfpResponseCounts.length > 0 ? Math.round((totalResponseCount / rfpResponseCounts.length) * 10) / 10 : 0;
      
      return {
        avgResponseTime: avgResponseTimeDays > 0 ? `${avgResponseTimeDays} days` : 'N/A',
        responseRate: rfpsWithResponses,
        successRate: awardedRfps,
        avgResponsesPerRfp
      };
    })(),
    
    // System Performance Metrics
    (async () => {
      const [totalLogins, errorCount] = await Promise.all([
        // Total logins in last week
        prisma.auditTrail.count({
          where: {
            action: 'USER_LOGIN',
            created_at: { gte: lastWeek }
          }
        }),
        
        // Error count in last week
        prisma.auditTrail.count({
          where: {
            action: { contains: 'ERROR' },
            created_at: { gte: lastWeek }
          }
        })
      ]);
      
      return {
        totalLogins,
        errorRate: totalLogins > 0 ? ((errorCount / totalLogins) * 100).toFixed(1) : '0',
        avgSessionDuration: '12m 30s' // Mock data for now
      };
    })(),
    
    // Top Performing Buyers (by RFPs created)
    prisma.user.findMany({
      where: {
        role: { name: 'Buyer' }
      },
      include: {
        _count: {
          select: { rfps: true }
        }
      },
      orderBy: {
        rfps: { _count: 'desc' }
      },
      take: 5
    }),
    
    // Top Performing Suppliers (by responses submitted)
    prisma.user.findMany({
      where: {
        role: { name: 'Supplier' }
      },
      include: {
        _count: {
          select: { supplier_responses: true }
        }
      },
      orderBy: {
        supplier_responses: { _count: 'desc' }
      },
      take: 5
    }),
    
    // RFP Category Distribution (mock data for now)
    Promise.resolve([
      { category: 'Technology', count: 45, percentage: 35 },
      { category: 'Services', count: 38, percentage: 30 },
      { category: 'Products', count: 25, percentage: 20 },
      { category: 'Consulting', count: 15, percentage: 12 },
      { category: 'Other', count: 5, percentage: 3 }
    ]),
    
    // Response Time Metrics using Prisma queries
    (async () => {
      const rfpsWithResponses = await prisma.rFP.findMany({
        where: {
          supplier_responses: {
            some: {}
          }
        },
        include: {
          supplier_responses: {
            orderBy: {
              created_at: 'asc'
            },
            take: 1
          }
        }
      });

      const timeRanges = {
        'Within 24h': 0,
        '24-72h': 0,
        '3-7 days': 0,
        'Over 7 days': 0
      };

      rfpsWithResponses.forEach(rfp => {
        if (rfp.supplier_responses.length > 0) {
          const responseTime = rfp.supplier_responses[0].created_at.getTime() - rfp.created_at.getTime();
          const hours = responseTime / (1000 * 60 * 60);
          
          if (hours < 24) {
            timeRanges['Within 24h']++;
          } else if (hours < 72) {
            timeRanges['24-72h']++;
          } else if (hours < 168) {
            timeRanges['3-7 days']++;
          } else {
            timeRanges['Over 7 days']++;
          }
        }
      });

      return Object.entries(timeRanges).map(([timeRange, count]) => ({
        time_range: timeRange,
        count
      }));
    })()
  ]);

  // Get RFP status labels for distribution
  const statusLabels = await prisma.rFPStatus.findMany({
    select: {
      id: true,
      label: true
    }
  });

  // Calculate percentages for RFP status distribution
  const totalRfpsForDistribution = rfpStatusDistribution.reduce((sum: number, item: any) => sum + item._count.status_id, 0);
  const rfpStatusWithPercentages = rfpStatusDistribution.map((item: any) => {
    const statusLabel = statusLabels.find(status => status.id === item.status_id)?.label || item.status_id;
    return {
      status: statusLabel,
      count: item._count.status_id,
      percentage: totalRfpsForDistribution > 0 ? Math.round((item._count.status_id / totalRfpsForDistribution) * 100) : 0
    };
  });

  // Calculate response rate percentage
  const responseRatePercentage = totalRfps > 0 ? Math.round((responseMetrics.responseRate / totalRfps) * 100) : 0;
  const successRatePercentage = totalRfps > 0 ? Math.round((responseMetrics.successRate / totalRfps) * 100) : 0;

  return {
    // Key Metrics
    totalRfps,
    totalResponses,
    newRfpsThisMonth,
    newResponsesThisMonth,
    
    // Charts Data
    monthlyGrowthData,
    rfpStatusDistribution: rfpStatusWithPercentages,
    rfpCategoryDistribution,
    responseTimeMetrics,
    
    // Performance Metrics
    responseMetrics: {
      ...responseMetrics,
      responseRate: `${responseRatePercentage}%`,
      successRate: `${successRatePercentage}%`
    },
    
    // System Metrics
    systemMetrics,
    
    // Top Performers
    topPerformingBuyers: topPerformingBuyers.map((user: any) => ({
      name: user.name,
      email: user.email,
      rfpsCreated: user._count.rfps
    })),
    
    topPerformingSuppliers: topPerformingSuppliers.map((user: any) => ({
      name: user.name,
      email: user.email,
      responsesSubmitted: user._count.supplier_responses
    }))
  };
};
