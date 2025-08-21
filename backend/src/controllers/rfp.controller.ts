import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import * as rfpService from '../services/rfp.service';
import { createRfpSchema, submitResponseSchema, updateResponseStatusSchema } from '../validations/rfp.validation';

export const createRfp = async (req: AuthenticatedRequest, res: Response) => {
    const validationResult = createRfpSchema.safeParse(req.body);

    if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.issues });
    }

    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const rfp = await rfpService.createRfp(validationResult.data, user.userId);
        res.status(201).json(rfp);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const publishRfp = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const updatedRfp = await rfpService.publishRfp(id, user.userId);
        res.json(updatedRfp);
    } catch (error: any) {
        if (error.message === 'RFP not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'You are not authorized to publish this RFP') {
            return res.status(403).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getPublishedRfps = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const rfps = await rfpService.getPublishedRfps();
        res.json(rfps);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const submitResponse = async (req: AuthenticatedRequest, res: Response) => {
    const validationResult = submitResponseSchema.safeParse(req.body);

    if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.issues });
    }

    const { id } = req.params;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const response = await rfpService.submitResponse(id, validationResult.data, user.userId);
        res.status(201).json(response);
    } catch (error: any) {
        if (error.message === 'RFP not found') {
            return res.status(404).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// export const updateResponseStatus = async (req: AuthenticatedRequest, res: Response) => {
//     const validationResult = updateResponseStatusSchema.safeParse(req.body);

//     if (!validationResult.success) {
//         return res.status(400).json({ errors: validationResult.error.issues });
//     }

//     const { responseId } = req.params;
//     const { status } = validationResult.data;
//     const user = req.user;

//     if (!user) {
//         return res.status(401).json({ message: 'Unauthorized' });
//     }

//     try {
//         const updatedResponse = await rfpService.updateResponseStatus(responseId, status, user.userId);
//         res.json(updatedResponse);
//     } catch (error: any) {
//         if (error.message === 'Response not found') {
//             return res.status(404).json({ message: error.message });
//         }
//         if (error.message === 'You are not authorized to update the status of this response') {
//             return res.status(403).json({ message: error.message });
//         }
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };
