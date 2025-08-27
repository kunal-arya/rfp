import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { hasPermission, protect } from '../middleware/auth.middleware';

const router = Router();

// Configuration Routes
/**
 * @swagger
 * /admin/config:
 *   get:
 *     summary: Get system configuration
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System configuration retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 */
router.get('/config', protect, hasPermission('admin', 'system_config'), adminController.getSystemConfig);

/**
 * @swagger
 * /admin/config:
 *   put:
 *     summary: Update system configuration
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: System configuration updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 */
router.put('/config', protect, hasPermission('admin', 'system_config'), adminController.updateSystemConfig);

/**
 * @swagger
 * /admin/database/stats:
 *   get:
 *     summary: Get database statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Database statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 */
router.get('/database/stats', protect, hasPermission('admin', 'system_config'), adminController.getDatabaseStats);

/**
 * @swagger
 * /admin/database/test:
 *   post:
 *     summary: Test database connection
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Database connection test completed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 */
router.post('/database/test', protect, hasPermission('admin', 'system_config'), adminController.testDatabaseConnection);

/**
 * @swagger
 * /admin/database/backup:
 *   post:
 *     summary: Create database backup
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Database backup created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 */
router.post('/database/backup', protect, hasPermission('admin', 'system_config'), adminController.createBackup);

/**
 * @swagger
 * /admin/database/optimize:
 *   post:
 *     summary: Optimize database
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Database optimization completed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 */
router.post('/database/optimize', protect, hasPermission('admin', 'system_config'), adminController.optimizeDatabase);

// Export Routes
/**
 * @swagger
 * /admin/export/users:
 *   post:
 *     summary: Export users data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               format:
 *                 type: string
 *                 enum: [csv, excel, pdf, json]
 *               dateRange:
 *                 type: object
 *               filters:
 *                 type: object
 *     responses:
 *       200:
 *         description: Users data exported successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 */
router.post('/export/users', protect, hasPermission('admin', 'export_data'), adminController.exportUsers);

/**
 * @swagger
 * /admin/export/rfps:
 *   post:
 *     summary: Export RFPs data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               format:
 *                 type: string
 *                 enum: [csv, excel, pdf, json]
 *               dateRange:
 *                 type: object
 *               filters:
 *                 type: object
 *     responses:
 *       200:
 *         description: RFPs data exported successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 */
router.post('/export/rfps', protect, hasPermission('admin', 'export_data'), adminController.exportRfps);

/**
 * @swagger
 * /admin/export/responses:
 *   post:
 *     summary: Export responses data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               format:
 *                 type: string
 *                 enum: [csv, excel, pdf, json]
 *               dateRange:
 *                 type: object
 *               filters:
 *                 type: object
 *     responses:
 *       200:
 *         description: Responses data exported successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 */
router.post('/export/responses', protect, hasPermission('admin', 'export_data'), adminController.exportResponses);

/**
 * @swagger
 * /admin/export/audit-logs:
 *   post:
 *     summary: Export audit logs data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               format:
 *                 type: string
 *                 enum: [csv, excel, pdf, json]
 *               dateRange:
 *                 type: object
 *               filters:
 *                 type: object
 *     responses:
 *       200:
 *         description: Audit logs data exported successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 */
router.post('/export/audit-logs', protect, hasPermission('admin', 'export_data'), adminController.exportAuditLogs);

// Response Management Routes
/**
 * @swagger
 * /admin/responses:
 *   get:
 *     summary: Get all responses (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Responses retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 */
router.get('/responses', protect, hasPermission('admin', 'view_analytics'), adminController.getAdminResponses);

/**
 * @swagger
 * /admin/responses/{id}:
 *   get:
 *     summary: Get response details (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Response ID
 *     responses:
 *       200:
 *         description: Response details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 *       404:
 *         description: Response not found
 */
router.get('/responses/:id', protect, hasPermission('admin', 'view_analytics'), adminController.getAdminResponse);

/**
 * @swagger
 * /admin/reports/generate:
 *   post:
 *     summary: Generate system report
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reportType:
 *                 type: string
 *                 enum: [user-activity, rfp-performance, revenue-analytics, system-usage]
 *               format:
 *                 type: string
 *                 enum: [csv, excel, pdf, json]
 *               dateRange:
 *                 type: object
 *               filters:
 *                 type: object
 *     responses:
 *       200:
 *         description: System report generated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 */
router.post('/reports/generate', protect, hasPermission('admin', 'export_data'), adminController.generateSystemReport);

/**
 * @swagger
 * /admin/reports/schedule:
 *   post:
 *     summary: Schedule report generation
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reportType:
 *                 type: string
 *               schedule:
 *                 type: object
 *                 properties:
 *                   frequency:
 *                     type: string
 *                     enum: [daily, weekly, monthly]
 *                   time:
 *                     type: string
 *                   recipients:
 *                     type: array
 *                     items:
 *                       type: string
 *     responses:
 *       200:
 *         description: Report scheduled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 */
router.post('/reports/schedule', protect, hasPermission('admin', 'export_data'), adminController.scheduleReport);

// User Management Routes
/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name or email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by role
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 */
router.get('/users', protect, hasPermission('admin', 'manage_users'), adminController.getUsers);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get specific user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 *       404:
 *         description: User not found
 */
router.get('/users/get/:id', protect, hasPermission('admin', 'manage_users'), adminController.getUser);

/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     summary: Update user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 *       404:
 *         description: User not found
 */
router.put('/users/:id', protect, hasPermission('admin', 'manage_users'), adminController.updateUser);

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 *       404:
 *         description: User not found
 */
router.delete('/users/:id', protect, hasPermission('admin', 'manage_users'), adminController.deleteUser);

/**
 * @swagger
 * /admin/users/{id}/toggle-status:
 *   put:
 *     summary: Toggle user status (activate/deactivate)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [activate, deactivate]
 *     responses:
 *       200:
 *         description: User status toggled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 *       404:
 *         description: User not found
 */
router.put('/users/:id/toggle-status', protect, hasPermission('admin', 'manage_users'), adminController.toggleUserStatus);

/**
 * @swagger
 * /admin/users/stats:
 *   get:
 *     summary: Get user statistics (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: number
 *                   description: Total number of users
 *                 userGrowthLastMonth:
 *                   type: string
 *                   description: Percentage change in users from last month
 *                 activeUsers:
 *                   type: number
 *                   description: Number of active users in last week
 *                 activeUserGrowthLastWeek:
 *                   type: string
 *                   description: Percentage change in active users from last week
 *                 totalBuyers:
 *                   type: number
 *                   description: Total number of buyers
 *                 totalSuppliers:
 *                   type: number
 *                   description: Total number of suppliers
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 */
router.get('/users/stats', protect, hasPermission('admin', 'manage_users'), adminController.getUserStats);

/**
 * @swagger
 * /admin/users:
 *   post:
 *     summary: Create a new user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - roleName
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password
 *               roleName:
 *                 type: string
 *                 enum: [Buyer, Supplier, Admin]
 *                 description: User's role
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request - validation error
 *       409:
 *         description: Conflict - user already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 */
router.post('/users', protect, hasPermission('admin', 'manage_users'), adminController.createUser);

/**
 * @swagger
 * /admin/analytics:
 *   get:
 *     summary: Get analytics data (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRfps:
 *                   type: number
 *                   description: Total number of RFPs
 *                 totalResponses:
 *                   type: number
 *                   description: Total number of responses
 *                 newRfpsThisMonth:
 *                   type: number
 *                   description: New RFPs created this month
 *                 newResponsesThisMonth:
 *                   type: number
 *                   description: New responses submitted this month
 *                 monthlyGrowthData:
 *                   type: array
 *                   description: Monthly growth data for the last 6 months
 *                 rfpStatusDistribution:
 *                   type: array
 *                   description: Distribution of RFP statuses
 *                 responseMetrics:
 *                   type: object
 *                   description: Response performance metrics
 *                 systemMetrics:
 *                   type: object
 *                   description: System performance metrics
 *                 topPerformingBuyers:
 *                   type: array
 *                   description: Top performing buyers
 *                 topPerformingSuppliers:
 *                   type: array
 *                   description: Top performing suppliers
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin permissions
 */
router.get('/analytics', protect, hasPermission('admin', 'view_analytics'), adminController.getAnalytics);

export default router;
