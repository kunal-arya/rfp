import { PrismaClient } from '@prisma/client';
import { createAuditEntry } from './audit.service';
import { AUDIT_ACTIONS } from '../utils/enum';

const prisma = new PrismaClient();

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: Record<string, any>;
  includeHeaders?: boolean;
}

export interface ExportResult {
  filename: string;
  downloadUrl: string;
  size: string;
  recordCount: number;
  generatedAt: string;
}

export const exportUsers = async (options: ExportOptions, adminId: string): Promise<ExportResult> => {
  const users = await prisma.user.findMany({
    include: {
      role: true,
    },
    where: {
      created_at: options.dateRange ? {
        gte: new Date(options.dateRange.start),
        lte: new Date(options.dateRange.end),
      } : undefined,
    },
  });

  const filename = `users-export-${new Date().toISOString().split('T')[0]}.${options.format}`;
  const downloadUrl = `/exports/${filename}`;
  const size = `${(users.length * 0.1).toFixed(1)} KB`;
  const recordCount = users.length;
  const generatedAt = new Date().toISOString();

  // Create audit entry
  await createAuditEntry(adminId, AUDIT_ACTIONS.DATA_EXPORTED, 'User', 'all', {
    format: options.format,
    recordCount,
    filename,
  });

  return {
    filename,
    downloadUrl,
    size,
    recordCount,
    generatedAt,
  };
};

export const exportRfps = async (options: ExportOptions, adminId: string): Promise<ExportResult> => {
  const rfps = await prisma.rFP.findMany({
    include: {
      buyer: true,
      status: true,
      current_version: true,
    },
    where: {
      created_at: options.dateRange ? {
        gte: new Date(options.dateRange.start),
        lte: new Date(options.dateRange.end),
      } : undefined,
    },
  });

  const filename = `rfps-export-${new Date().toISOString().split('T')[0]}.${options.format}`;
  const downloadUrl = `/exports/${filename}`;
  const size = `${(rfps.length * 0.2).toFixed(1)} KB`;
  const recordCount = rfps.length;
  const generatedAt = new Date().toISOString();

  // Create audit entry
  await createAuditEntry(adminId, AUDIT_ACTIONS.DATA_EXPORTED, 'RFP', 'all', {
    format: options.format,
    recordCount,
    filename,
  });

  return {
    filename,
    downloadUrl,
    size,
    recordCount,
    generatedAt,
  };
};

export const exportResponses = async (options: ExportOptions, adminId: string): Promise<ExportResult> => {
  const responses = await prisma.supplierResponse.findMany({
    include: {
      supplier: true,
      rfp: {
        include: {
          buyer: true,
        },
      },
      status: true,
    },
    where: {
      created_at: options.dateRange ? {
        gte: new Date(options.dateRange.start),
        lte: new Date(options.dateRange.end),
      } : undefined,
    },
  });

  const filename = `responses-export-${new Date().toISOString().split('T')[0]}.${options.format}`;
  const downloadUrl = `/exports/${filename}`;
  const size = `${(responses.length * 0.3).toFixed(1)} KB`;
  const recordCount = responses.length;
  const generatedAt = new Date().toISOString();

  // Create audit entry
  await createAuditEntry(adminId, AUDIT_ACTIONS.DATA_EXPORTED, 'SupplierResponse', 'all', {
    format: options.format,
    recordCount,
    filename,
  });

  return {
    filename,
    downloadUrl,
    size,
    recordCount,
    generatedAt,
  };
};

export const exportAuditLogs = async (options: ExportOptions, adminId: string): Promise<ExportResult> => {
  const auditLogs = await prisma.auditTrail.findMany({
    include: {
      user: true,
    },
    where: {
      created_at: options.dateRange ? {
        gte: new Date(options.dateRange.start),
        lte: new Date(options.dateRange.end),
      } : undefined,
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  const filename = `audit-logs-export-${new Date().toISOString().split('T')[0]}.${options.format}`;
  const downloadUrl = `/exports/${filename}`;
  const size = `${(auditLogs.length * 0.15).toFixed(1)} KB`;
  const recordCount = auditLogs.length;
  const generatedAt = new Date().toISOString();

  // Create audit entry
  await createAuditEntry(adminId, AUDIT_ACTIONS.DATA_EXPORTED, 'AuditTrail', 'all', {
    format: options.format,
    recordCount,
    filename,
  });

  return {
    filename,
    downloadUrl,
    size,
    recordCount,
    generatedAt,
  };
};

export const generateSystemReport = async (reportType: string, options: ExportOptions, adminId: string): Promise<ExportResult> => {
  let data: any[] = [];
  let recordCount = 0;

  switch (reportType) {
    case 'user-activity':
      data = await generateUserActivityReport(options);
      break;
    case 'rfp-performance':
      data = await generateRfpPerformanceReport(options);
      break;
    case 'revenue-analytics':
      data = await generateRevenueAnalyticsReport(options);
      break;
    case 'system-usage':
      data = await generateSystemUsageReport(options);
      break;
    default:
      throw new Error(`Unknown report type: ${reportType}`);
  }

  recordCount = data.length;
  const filename = `${reportType}-report-${new Date().toISOString().split('T')[0]}.${options.format}`;
  const downloadUrl = `/exports/${filename}`;
  const size = `${(recordCount * 0.1).toFixed(1)} KB`;
  const generatedAt = new Date().toISOString();

  // Create audit entry
  await createAuditEntry(adminId, AUDIT_ACTIONS.REPORT_GENERATED, 'Report', reportType, {
    format: options.format,
    recordCount,
    filename,
  });

  return {
    filename,
    downloadUrl,
    size,
    recordCount,
    generatedAt,
  };
};

const generateUserActivityReport = async (options: ExportOptions) => {
  // Mock user activity data
  return [
    { date: '2024-01-20', newUsers: 15, activeUsers: 89, totalLogins: 234 },
    { date: '2024-01-19', newUsers: 12, activeUsers: 76, totalLogins: 198 },
    { date: '2024-01-18', newUsers: 18, activeUsers: 92, totalLogins: 245 },
  ];
};

const generateRfpPerformanceReport = async (options: ExportOptions) => {
  // Mock RFP performance data
  return [
    { status: 'Published', count: 45, avgResponses: 3.2, successRate: 78 },
    { status: 'Closed', count: 23, avgResponses: 2.8, successRate: 65 },
    { status: 'Awarded', count: 18, avgResponses: 4.1, successRate: 89 },
  ];
};

const generateRevenueAnalyticsReport = async (options: ExportOptions) => {
  // Mock revenue analytics data
  return [
    { month: 'January', revenue: 45000, rfps: 23, avgValue: 1956 },
    { month: 'December', revenue: 38000, rfps: 19, avgValue: 2000 },
    { month: 'November', revenue: 42000, rfps: 21, avgValue: 2000 },
  ];
};

const generateSystemUsageReport = async (options: ExportOptions) => {
  // Mock system usage data
  return [
    { metric: 'Total Users', value: 1250, change: '+12%' },
    { metric: 'Active RFPs', value: 89, change: '+5%' },
    { metric: 'Total Responses', value: 456, change: '+18%' },
    { metric: 'System Uptime', value: '99.9%', change: '0%' },
  ];
};

export const scheduleReport = async (
  reportType: string,
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
  },
  adminId: string
) => {
  // In a real implementation, this would create a scheduled job
  const scheduledReport = {
    id: `scheduled-${Date.now()}`,
    reportType,
    schedule,
    status: 'active',
    nextRun: calculateNextRun(schedule.frequency, schedule.time),
    createdBy: adminId,
    createdAt: new Date().toISOString(),
  };

  // Create audit entry
  await createAuditEntry(adminId, AUDIT_ACTIONS.REPORT_SCHEDULED, 'Report', reportType, {
    frequency: schedule.frequency,
    recipients: schedule.recipients,
  });

  return scheduledReport;
};

const calculateNextRun = (frequency: string, time: string): string => {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  
  switch (frequency) {
    case 'daily':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hours, minutes).toISOString();
    case 'weekly':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, hours, minutes).toISOString();
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate(), hours, minutes).toISOString();
    default:
      return now.toISOString();
  }
};
