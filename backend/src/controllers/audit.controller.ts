import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { auditService } from '../services/audit.service';

// Get user's own audit trails
export const getUserAuditTrails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const action = req.query.action as string;

    // Extract additional filters (excluding search, action, page, limit)
    const { search: _, action: __, page: ___, limit: ____, ...additionalFilters } = req.query;

    const auditTrails = await auditService.getUserAuditTrails(user.userId, page, limit, search, action, additionalFilters);
    res.json(auditTrails);
  } catch (error: any) {
    console.error('Failed to get user audit trails:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get audit trails for a specific target (RFP, Response, etc.)
export const getTargetAuditTrails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { targetType, targetId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const auditTrails = await auditService.getTargetAuditTrails(targetType, targetId, page, limit);
    res.json(auditTrails);
  } catch (error: any) {
    console.error('Failed to get target audit trails:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all audit trails (admin only)
export const getAllAuditTrails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Parse filters from query parameters
    const filters: any = {};
    if (req.query.user_id) filters.user_id = req.query.user_id as string;
    if (req.query.action) filters.action = req.query.action as string;
    if (req.query.target_type) filters.target_type = req.query.target_type as string;
    if (req.query.target_id) filters.target_id = req.query.target_id as string;

    const auditTrails = await auditService.getAllAuditTrails(page, limit, filters);
    res.json(auditTrails);
  } catch (error: any) {
    console.error('Failed to get all audit trails:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
