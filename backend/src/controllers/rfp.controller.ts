import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import * as rfpService from '../services/rfp.service';
import { createRfpSchema, getRfpResponsesSchema, submitResponseSchema, reviewResponseSchema } from '../validations/rfp.validation';
import { modifyGeneralFilterPrisma } from '../utils/filters';

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
    const { rfp_id } = req.params;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const updatedRfp = await rfpService.publishRfp(rfp_id, user.userId);
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
        let { page: pageNumber, limit: limitNumber, search, ...filters } = req.query;

        const page: number = pageNumber ? parseInt(pageNumber as string) : 1;
        const limit: number = limitNumber ? parseInt(limitNumber as string) : 10;
        const offset = (page - 1) * limit;

        // Split filters for RFP vs RFPVersion fields
        const rfpFilterKeys = ['title', 'status_id', 'buyer_id', 'created_at'];
        const versionFilterKeys = ['budget_min', 'budget_max', 'deadline', 'description', 'requirements'];

        const rfpFilters: any = {};
        const versionFilters: any = {};

        for (let key in filters) {
            const columnKey = key.split('___')[1];
            if (rfpFilterKeys.includes(columnKey)) rfpFilters[key] = filters[key];
            else if (versionFilterKeys.includes(columnKey)) versionFilters[key] = filters[key];
        }

        const generalFilters = modifyGeneralFilterPrisma(rfpFilters);
        const versionGeneralFilters = modifyGeneralFilterPrisma(versionFilters);

        const rfps = await rfpService.getPublishedRfps(
            generalFilters,
            versionGeneralFilters,
            offset,
            limit,
            search as string | undefined
        );

        res.json(rfps);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createDraftResponse = async (req: AuthenticatedRequest, res: Response) => {
    const validationResult = submitResponseSchema.safeParse(req.body);

    if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.issues });
    }

    const { rfp_id } = req.params;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const response = await rfpService.createDraftResponse(rfp_id, validationResult.data, user.userId);
        res.status(201).json(response);
    } catch (error: any) {
        if (error.message === 'RFP not found') {
            return res.status(404).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const submitDraftResponse = async (req: AuthenticatedRequest, res: Response) => {
    const { responseId } = req.params;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const updatedResponse = await rfpService.submitDraftResponse(responseId, user.userId);
        res.json(updatedResponse);
    } catch (error: any) {
        if (error.message === 'Response not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'You are not authorized to submit this response') {
            return res.status(403).json({ message: error.message });
        }
        if (error.message === 'Response is not in Draft status') {
            return res.status(400).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export async function getNBAResponses(req: AuthenticatedRequest, res: Response) {
    const validationResult = getRfpResponsesSchema.safeParse(req.params);

    if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.issues });
    }

    const { rfp_id } = validationResult.data;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const responses = await rfpService.getNBAResponses(rfp_id, user.userId);
        res.json(responses);
    } catch (error: any) {
        if (error.message === 'RFP not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'You are not authorized to view responses for this RFP') {
            return res.status(403).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const reviewRfpResponse = async (req: AuthenticatedRequest, res: Response) => {
    const validationResult = reviewResponseSchema.safeParse(req.body);

    if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.issues });
    }

    const { rfp_id } = req.params;
    const { status } = validationResult.data;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const updatedResponse = await rfpService.reviewRfpResponse(rfp_id, status, user.userId);
        res.json(updatedResponse);
    } catch (error: any) {
        if (error.message === 'Response not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'You are not authorized to review this response') {
            return res.status(403).json({ message: error.message });
        }
        if (error.message.startsWith('Invalid status')) {
            return res.status(400).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const uploadRfpDocument = async (req: AuthenticatedRequest, res: Response) => {
    const { rfp_version_id } = req.params;
    const user = req.user;
    const file = req.file;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const document = await rfpService.uploadRfpDocument(rfp_version_id, user.userId, file);
        res.status(201).json(document);
    } catch (error: any) {
        if (error.message === 'RFP not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'You are not authorized to upload documents for this RFP') {
            return res.status(403).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const uploadResponseDocument = async (req: AuthenticatedRequest, res: Response) => {
    const { responseId } = req.params;
    const user = req.user;
    const file = req.file;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const document = await rfpService.uploadResponseDocument(responseId, user.userId, file);
        res.status(201).json(document);
    } catch (error: any) {
        if (error.message === 'Response not found') {
            return res.status(404).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
