import { PrismaClient } from '@prisma/client';
import { modifyGeneralFilterPrisma } from '../utils/filters';

const prisma = new PrismaClient();

export interface AuditAction {
  action: string;
  target_type?: string;
  target_id?: string;
  details?: any;
}

export const auditService = {
  // Create an audit trail entry
  createAuditTrail: async (userId: string, auditAction: AuditAction) => {
    try {
      const auditTrail = await prisma.auditTrail.create({
        data: {
          user_id: userId,
          action: auditAction.action,
          target_type: auditAction.target_type,
          target_id: auditAction.target_id,
          details: auditAction.details || {},
        },
      });
      return auditTrail;
    } catch (error) {
      console.error('Failed to create audit trail:', error);
      // Don't throw error to avoid breaking the main functionality
      return null;
    }
  },

  // Get audit trails for a user
  getUserAuditTrails: async (userId: string, page: number = 1, limit: number = 10, search?: string, action?: string, filters?: any) => {
    const offset = (page - 1) * limit;
    
    const whereClause: any = { user_id: userId };
    
    if (search) {
      whereClause.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { details: { path: ['$'], string_contains: search } },
      ];
    }
    
    if (action) {
      whereClause.action = action;
    }

    // Apply additional filters using the filter utility
    if (filters) {
      const additionalFilters = modifyGeneralFilterPrisma(filters);
      Object.assign(whereClause, additionalFilters);
    }
    
    const [auditTrails, total] = await Promise.all([
      prisma.auditTrail.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.auditTrail.count({
        where: whereClause,
      }),
    ]);

    return {
      data: auditTrails,
      total,
      page,
      limit,
    };
  },

  // Get audit trails for a specific target
  getTargetAuditTrails: async (targetType: string, targetId: string, page: number = 1, limit: number = 10) => {
    const offset = (page - 1) * limit;
    
    const [auditTrails, total] = await Promise.all([
      prisma.auditTrail.findMany({
        where: {
          target_type: targetType,
          target_id: targetId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.auditTrail.count({
        where: {
          target_type: targetType,
          target_id: targetId,
        },
      }),
    ]);

    return {
      data: auditTrails,
      total,
      page,
      limit,
    };
  },

  // Get all audit trails (admin only)
  getAllAuditTrails: async (page: number = 1, limit: number = 10, filters?: any) => {
    const offset = (page - 1) * limit;
    
    const whereClause: any = {};
    
    if (filters?.user_id) {
      whereClause.user_id = filters.user_id;
    }
    
    if (filters?.action) {
      whereClause.action = { contains: filters.action, mode: 'insensitive' };
    }
    
    if (filters?.target_type) {
      whereClause.target_type = filters.target_type;
    }
    
    if (filters?.target_id) {
      whereClause.target_id = filters.target_id;
    }

    const [auditTrails, total] = await Promise.all([
      prisma.auditTrail.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.auditTrail.count({
        where: whereClause,
      }),
    ]);

    return {
      data: auditTrails,
      total,
      page,
      limit,
    };
  },
};

// Predefined audit actions
export const AUDIT_ACTIONS = {
  // RFP Actions
  RFP_CREATED: 'RFP_CREATED',
  RFP_UPDATED: 'RFP_UPDATED',
  RFP_DELETED: 'RFP_DELETED',
  RFP_PUBLISHED: 'RFP_PUBLISHED',
  RFP_STATUS_CHANGED: 'RFP_STATUS_CHANGED',
  
  // Response Actions
  RESPONSE_CREATED: 'RESPONSE_CREATED',
  RESPONSE_UPDATED: 'RESPONSE_UPDATED',
  RESPONSE_DELETED: 'RESPONSE_DELETED',
  RESPONSE_SUBMITTED: 'RESPONSE_SUBMITTED',
  RESPONSE_MOVED_TO_REVIEW: 'RESPONSE_MOVED_TO_REVIEW',
  RESPONSE_APPROVED: 'RESPONSE_APPROVED',
  RESPONSE_REJECTED: 'RESPONSE_REJECTED',
  RESPONSE_AWARDED: 'RESPONSE_AWARDED',
  
  // Document Actions
  DOCUMENT_UPLOADED: 'DOCUMENT_UPLOADED',
  DOCUMENT_DELETED: 'DOCUMENT_DELETED',
  
  // User Actions
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  USER_REGISTERED: 'USER_REGISTERED',
  USER_PROFILE_UPDATED: 'USER_PROFILE_UPDATED',
  
  // System Actions
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
};

// Helper function to create audit trail entries
export const createAuditEntry = async (userId: string, action: string, targetType?: string, targetId?: string, details?: any) => {
  return await auditService.createAuditTrail(userId, {
    action,
    target_type: targetType,
    target_id: targetId,
    details,
  });
};
