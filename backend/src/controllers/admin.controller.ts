import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';
import * as configService from '../services/config.service';
import * as exportService from '../services/export.service';
import * as adminService from '../services/admin.service';
import * as analyticsService from '../services/analytics.service';
import * as rfpService from '../services/rfp.service';

const prisma = new PrismaClient();

// Configuration Controllers
export const getSystemConfig = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const config = await configService.getSystemConfig();
    res.json(config);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Failed to get system configuration' });
  }
};

export const updateSystemConfig = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const config = await configService.updateSystemConfig(req.body);
    res.json(config);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update system configuration' });
  }
};

export const getDatabaseStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await configService.getDatabaseStats();
    res.json(stats);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Failed to get database statistics' });
  }
};

export const testDatabaseConnection = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isConnected = await configService.testDatabaseConnection();
    res.json({ connected: isConnected });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Failed to test database connection' });
  }
};

export const createBackup = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const backupPath = await configService.createBackup();
    res.json({ backupPath, message: 'Backup created successfully' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create backup' });
  }
};

export const optimizeDatabase = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await configService.optimizeDatabase();
    res.json({ message: result });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Failed to optimize database' });
  }
};

// Export Controllers
export const exportUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { format, dateRange, filters } = req.body;
    const options = { format, dateRange, filters };
    
    const result = await exportService.exportUsers(options, req.user!.userId);
    res.json(result);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Failed to export users' });
  }
};

export const exportRfps = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { format, dateRange, filters } = req.body;
    const options = { format, dateRange, filters };
    
    const result = await exportService.exportRfps(options, req.user!.userId);
    res.json(result);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Failed to export RFPs' });
  }
};

export const exportResponses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { format, dateRange, filters } = req.body;
    const options = { format, dateRange, filters };
    
    const result = await exportService.exportResponses(options, req.user!.userId);
    res.json(result);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Failed to export responses' });
  }
};

export const exportAuditLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { format, dateRange, filters } = req.body;
    const options = { format, dateRange, filters };
    
    const result = await exportService.exportAuditLogs(options, req.user!.userId);
    res.json(result);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Failed to export audit logs' });
  }
};

export const generateSystemReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reportType, format, dateRange, filters } = req.body;
    const options = { format, dateRange, filters };
    
    const result = await exportService.generateSystemReport(reportType, options, req.user!.userId);
    res.json(result);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate system report' });
  }
};

export const scheduleReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reportType, schedule } = req.body;
    
    const result = await exportService.scheduleReport(reportType, schedule, req.user!.userId);
    res.json(result);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Failed to schedule report' });
  }
};

// User Management Controllers
export const getUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page, limit, search, role, status } = req.query;
    
    const result = await adminService.getUsers({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string,
      role: role as string,
      status: status as string,
      user: req.user as any,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Failed to get users' });
  }
};

export const getUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await adminService.getUser(id);
    res.json(user);
  } catch (error: any) {
    if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Failed to get user' });
  }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const user = await adminService.updateUser(id, { name, email, role });
    res.json(user);
  } catch (error: any) {
    if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await adminService.deleteUser(id);
    res.json(result);
  } catch (error: any) {
    if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

export const toggleUserStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'activate' or 'deactivate'
    
    const result = await adminService.toggleUserStatus(id, action);
    res.json(result);
  } catch (error: any) {
    if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Error toggling user status:', error);
    res.status(500).json({ message: 'Failed to toggle user status' });
  }
};

export const getUserStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await adminService.getUserStats();
    res.json(stats);
  } catch (error: any) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ message: 'Failed to get user stats' });
  }
};

export const createUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, password, roleName } = req.body;

    // Basic validation
    if (!name || !email || !password || !roleName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!['Buyer', 'Supplier', 'Admin'].includes(roleName)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await adminService.createUser({ name, email, password, roleName });
    res.status(201).json(user);
  } catch (error: any) {
    if (error.message === 'User with this email already exists') {
      return res.status(409).json({ message: error.message });
    }
    if (error.message === 'Invalid role') {
      return res.status(400).json({ message: error.message });
    }
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
};

// Analytics Controllers
export const getAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const analyticsData = await analyticsService.getAnalyticsData();
    res.json(analyticsData);
  } catch (error: any) {
    console.error('Error getting analytics data:', error);
    res.status(500).json({ message: 'Failed to get analytics data' });
  }
};

// Response Management Controllers
export const getAdminResponses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search as string;
    const status = req.query.status as string;

    // Create filters for admin to get all responses
    const responseFilters: any = {};
    if (status) {
      const statusRecord = await prisma.supplierResponseStatus.findUnique({
        where: { code: status }
      });
      if (statusRecord) {
        responseFilters.status_id = statusRecord.id;
      }
    }

    const responses = await prisma.supplierResponse.findMany({
      where: {
        ...responseFilters,
        ...(search && {
          OR: [
            { cover_letter: { contains: search, mode: 'insensitive' } },
            { rfp: { title: { contains: search, mode: 'insensitive' } } },
            { supplier: { email: { contains: search, mode: 'insensitive' } } },
          ],
        }),
      },
      skip: offset,
      take: limit,
      include: {
        rfp: {
          include: {
            current_version: true,
            status: true,
            buyer: true,
          },
        },
        status: true,
        supplier: true,
        documents: true,
      },
      orderBy: { created_at: 'desc' },
    });

    const total = await prisma.supplierResponse.count({
      where: {
        ...responseFilters,
        ...(search && {
          OR: [
            { cover_letter: { contains: search, mode: 'insensitive' } },
            { rfp: { title: { contains: search, mode: 'insensitive' } } },
            { supplier: { email: { contains: search, mode: 'insensitive' } } },
          ],
        }),
      },
    });

    res.json({ 
      data: responses, 
      total, 
      page, 
      limit 
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Failed to get responses' });
  }
};

export const getAdminResponse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const response = await prisma.supplierResponse.findUnique({
      where: { id },
      include: {
        rfp: {
          include: {
            current_version: true,
            status: true,
            buyer: true,
          },
        },
        status: true,
        supplier: true,
        documents: true,
      },
    });

    if (!response) {
      return res.status(404).json({ message: 'Response not found' });
    }

    res.json(response);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Failed to get response details' });
  }
};
