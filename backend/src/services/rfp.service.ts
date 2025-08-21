import { PrismaClient } from '@prisma/client';
import { CreateRfpData, SubmitResponseData } from '../validations/rfp.validation';
import { uploadToCloudinary } from '../utils/cloudinary';
import { RFP_STATUS, SUPPLIER_RESPONSE_STATUS } from '../utils/enum';

const prisma = new PrismaClient();

export const createRfp = async (rFPData: CreateRfpData, buyerId: string) => {
    const { title, description, requirements, budget_min, budget_max, deadline, notes } = rFPData;

    const draftStatus = await prisma.rFPStatus.findUnique({
        where: { code: RFP_STATUS.Draft },
    });

    if (!draftStatus) {
        // This should not happen if the database is seeded correctly
        throw new Error('Draft status not found');
    }

    const rFP = await prisma.rFP.create({
        data: {
            title,
            status_id: draftStatus.id,
            buyer_id: buyerId,
            versions: {
                create: {
                    version_number: 1,
                    description,
                    requirements,
                    budget_min,
                    budget_max,
                    deadline,
                    notes,
                },
            },
        },
        include: {
            versions: true,
        },
    });

    return rFP;
};

export const publishRfp = async (rFPId: string, userId: string) => {
    const rFP = await prisma.rFP.findUnique({
        where: { id: rFPId },
    });

    if (!rFP) {
        throw new Error('RFP not found');
    }

    const publishedStatus = await prisma.rFPStatus.findUnique({
        where: { code: RFP_STATUS.Published },
    });

    if (!publishedStatus) {
        // This should not happen if the database is seeded correctly
        throw new Error('Published status not found');
    }

    const updatedRfp = await prisma.rFP.update({
        where: { id: rFPId },
        data: {
            status_id: publishedStatus.id,
        },
    });

    return updatedRfp;
};

export const getPublishedRfps = async (
    rfpFilters: any,
    versionFilters: any,
    offset: number,
    limit: number,
    search?: string
) => {
    const publishedStatus = await prisma.rFPStatus.findUnique({
        where: { code: 'Published' },
    });

    if (!publishedStatus) {
        throw new Error('Published status not found');
    }

    // Apply version filters to current_version
    if (Object.keys(versionFilters).length > 0) {
        rfpFilters.current_version = { ...versionFilters };
    }

    // Add search across RFP and current_version fields
    if (search) {
        rfpFilters.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { current_version: { description: { contains: search, mode: 'insensitive' } } },
            { current_version: { requirements: { contains: search, mode: 'insensitive' } } },
            { buyer: { name: { contains: search, mode: 'insensitive' } } }
        ];
    }

    const rfps = await prisma.rFP.findMany({
        where: {
            status_id: publishedStatus.id,
            ...rfpFilters
        },
        skip: offset,
        take: limit,
        include: {
            current_version: true,
            buyer: true,
            supplier_responses: true
        },
        orderBy: { created_at: 'desc' }
    });

    const total = await prisma.rFP.count({
        where: {
            status_id: publishedStatus.id,
            ...rfpFilters
        }
    });

    return { total, page: offset / ( limit + 1 ), limit, data: rfps };
};

export const createDraftResponse = async (rFPId: string, responseData: SubmitResponseData, supplierId: string) => {
    const { proposed_budget, timeline, cover_letter } = responseData;

    const rFP = await prisma.rFP.findUnique({
        where: { id: rFPId },
    });

    if (!rFP) {
        throw new Error('RFP not found');
    }

    const draftStatus = await prisma.supplierResponseStatus.findUnique({
        where: { code: 'Draft' },
    });

    if (!draftStatus) {
        // This should not happen if the database is seeded correctly
        throw new Error('Draft status not found');
    }

    const response = await prisma.supplierResponse.create({
        data: {
            rfp_id: rFPId,
            supplier_id: supplierId,
            status_id: draftStatus.id,
            proposed_budget,
            timeline,
            cover_letter,
        },
    });

    return response;
};

export const submitDraftResponse = async (responseId: string, userId: string) => {
    const response = await prisma.supplierResponse.findUnique({
        where: { id: responseId },
    });

    if (!response) {
        throw new Error('Response not found');
    }

    const draftStatus = await prisma.supplierResponseStatus.findUnique({
        where: { code: SUPPLIER_RESPONSE_STATUS.Draft },
    });

    if (response.status_id !== draftStatus?.id) {
        throw new Error('Response is not in Draft status');
    }

    const submittedStatus = await prisma.supplierResponseStatus.findUnique({
        where: { code: SUPPLIER_RESPONSE_STATUS.Submitted },
    });

    if (!submittedStatus) {
        throw new Error('Submitted status not found');
    }

    const updatedResponse = await prisma.$transaction(async (tx) => {
        const updatedResponse = await tx.supplierResponse.update({
            where: { id: responseId },
            data: {
                status_id: submittedStatus.id,
            },
        });

        const responseSubmittedStatus = await tx.rFPStatus.findUnique({
            where: { code: RFP_STATUS.Response_Submitted },
        });

        if (!responseSubmittedStatus) {
            // This should not happen if the database is seeded correctly
            throw new Error('Published status not found');
        }
        
        const updatedRfp = await prisma.rFP.update({
            where: { id: response.rfp_id },
            data: {
                status_id: responseSubmittedStatus.id,
            },
        });

        return { updatedResponse, updatedRfp };
    });

    return updatedResponse;
};

export const getNBAResponses = async (rFPId: string, userId: string) => {
    const rFP = await prisma.rFP.findUnique({
        where: { id: rFPId },
    });

    if (!rFP) {
        throw new Error('RFP not found');
    }

    const responses = await prisma.supplierResponse.findMany({
        where: {
            rfp_id: rFPId,
        },
        include: {
            supplier: true,
        },
    });

    return responses;
};

export const reviewRfpResponse = async (rfp_id: string, status: 'Approved' | 'Rejected', userId: string) => {
    let updated_rfp
    if (status === RFP_STATUS.Approved) {
        const rfpApprovedStatus = await prisma.rFPStatus.findUnique({
            where: { code: RFP_STATUS.Approved },
        });
        if (!rfpApprovedStatus) {
            throw new Error('RFP Approved status not found');
        }
        updated_rfp = await prisma.rFP.update({
            where: { id: rfp_id },
            data: {
                status_id: rfpApprovedStatus.id,
            },
        });
    } else { // Rejected
        const rfpRejectedStatus = await prisma.rFPStatus.findUnique({
            where: { code: RFP_STATUS.Rejected },
        });
        if (!rfpRejectedStatus) {
            throw new Error('RFP Rejected status not found');
        }
        updated_rfp = await prisma.rFP.update({
            where: { id: rfp_id },
            data: {
                status_id: rfpRejectedStatus.id,
            },
        });
    }

    return updated_rfp;
};

export const uploadRfpDocument = async (rfp_version_id: string, userId: string, file: Express.Multer.File) => {
    const rFP_version = await prisma.rFPVersion.findUnique({
        where: { id: rfp_version_id }
    });

    if (!rFP_version) {
        throw new Error('RFP Version not found');
    }

    const uploadResult = await uploadToCloudinary(file.buffer);

    const document = await prisma.document.create({
        data: {
            file_name: file.originalname,
            url: uploadResult.secure_url,
            rfp_version_id: rfp_version_id,
            uploader_id: userId
        },
    });

    return document;
};

export const uploadResponseDocument = async (responseId: string, userId: string, file: Express.Multer.File) => {
    const response = await prisma.supplierResponse.findUnique({
        where: { id: responseId },
    });

    if (!response) {
        throw new Error('Response not found');
    }

    const uploadResult = await uploadToCloudinary(file.buffer);

    const document = await prisma.document.create({
        data: {
            file_name: file.originalname,
            url: uploadResult.secure_url,
            rfp_response_id: responseId,
            uploader_id: userId
        },
    });

    return document;
};