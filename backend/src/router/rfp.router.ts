import { Router } from 'express';
import * as rfpController from '../controllers/rfp.controller';
import { protect, hasPermission } from '../middleware/auth.middleware';

const router = Router();

// Protect all routes in this router with a valid JWT
router.use(protect);

/**
 * @swagger
 * /rfps:
 *   get:
 *     summary: Get all published RFPs
 *     tags: [RFPs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of published RFPs
 *       401:
 *         description: Unauthorized
 */
router.get(
    '/',
    hasPermission('rfp', 'view'),
    rfpController.getPublishedRfps
);

/**
 * @swagger
 * /rfps:
 *   post:
 *     summary: Create a new RFP
 *     tags: [RFPs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               requirements:
 *                 type: string
 *               budget_min:
 *                 type: number
 *               budget_max:
 *                 type: number
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: RFP created successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
    '/',
    hasPermission('rfp', 'create'),
    rfpController.createRfp
);

/**
 * @swagger
 * /rfps/{id}/publish:
 *   put:
 *     summary: Publish an RFP
 *     tags: [RFPs]
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
 *         description: RFP published successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: RFP not found
 */
router.put(
    '/:id/publish',
    hasPermission('rfp', 'publish'),
    rfpController.publishRfp
);

/**
 * @swagger
 * /rfps/{id}/responses:
 *   post:
 *     summary: Submit a response to an RFP
 *     tags: [RFPs]
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
 *               proposed_budget:
 *                 type: number
 *               timeline:
 *                 type: string
 *               cover_letter:
 *                 type: string
 *     responses:
 *       201:
 *         description: Response submitted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: RFP not found
 */
router.post(
    '/:id/responses',
    hasPermission('supplier_response', 'submit'),
    rfpController.submitResponse
);

/**
 * @swagger
 * /rfps/responses/{responseId}:
 *   put:
 *     summary: Update the status of a response
 *     tags: [RFPs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: responseId
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
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Response status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Response not found
 */
// router.put(
//     '/responses/:responseId',
//     hasPermission('supplier_response', 'update_status'),
//     rfpController.updateResponseStatus
// );

export default router;
