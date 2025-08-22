import { PrismaClient } from '@prisma/client';
import { CreateRfpData, SubmitResponseData } from '../validations/rfp.validation';
import { uploadToCloudinary } from '../utils/cloudinary';
import { RFP_STATUS, SUPPLIER_RESPONSE_STATUS } from '../utils/enum';
import { sendRfpPublishedNotification, sendResponseSubmittedNotification, sendRfpStatusChangeNotification } from './email.service';
import { notifyRfpPublished, notifyResponseSubmitted, notifyRfpStatusChanged } from './websocket.service';

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

    let updateRfp;

    await prisma.$transaction(async (tx) => {
        // First create the RFP without current_version_id
        const rFP = await tx.rFP.create({
            data: {
                title,
                status_id: draftStatus.id,
                buyer_id: buyerId,
            },
        });

        // Then create the first version
        const version = await tx.rFPVersion.create({
            data: {
                rfp_id: rFP.id,
                version_number: 1,
                description,
                requirements,
                budget_min,
                budget_max,
                deadline,
                notes,
            },
        });

        // Update the RFP to set the current_version_id
        updateRfp = await tx.rFP.update({
            where: { id: rFP.id },
            data: { current_version_id: version.id },
            include: {
                versions: true,
                current_version: true,
                status: true,
                buyer: true,
            },
        });
    });

    return updateRfp;
};

export const getMyRfps = async (
    userId: string,
    rfpFilters: any,
    versionFilters: any,
    offset: number,
    limit: number,
    search?: string
) => {
    const whereClause: any = {
        buyer_id: userId,
        ...rfpFilters,
    };

    // Apply version filters to current_version
    if (Object.keys(versionFilters).length > 0) {
        whereClause.current_version = { ...versionFilters };
    }

    // Add search across RFP and current_version fields
    if (search) {
        whereClause.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { current_version: { description: { contains: search, mode: 'insensitive' } } },
            { current_version: { requirements: { contains: search, mode: 'insensitive' } } },
        ];
    }

    const rfps = await prisma.rFP.findMany({
        where: whereClause,
        skip: offset,
        take: limit,
        include: {
            current_version: {
                include: {
                    documents: true, // Include documents for the current version
                },
            },
            status: true,
            supplier_responses: {
                include: {
                    supplier: true,
                    status: true,
                },
            },
        },
        orderBy: { created_at: 'desc' },
    });

    const total = await prisma.rFP.count({
        where: whereClause,
    });

    return { total, page: Math.floor(offset / limit) + 1, limit, data: rfps };
};

export const getRfpById = async (rfpId: string, userId: string) => {
    const rfp = await prisma.rFP.findUnique({
        where: { id: rfpId },
        include: {
            current_version: {
                include: {
                    documents: true, // Include documents for the current version
                },
            },
            status: true,
            buyer: true,
            supplier_responses: {
                include: {
                    supplier: true,
                    status: true,
                },
            },
        },
    });

    if (!rfp) {
        throw new Error('RFP not found');
    }

    // Check if user can view this RFP
    // Buyers can view their own RFPs, Suppliers can view published RFPs
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
    });

    if (!user) {
        throw new Error('User not found');
    }

    if (user.role.name === 'Buyer') {
        if (rfp.buyer_id !== userId) {
            throw new Error('You are not authorized to view this RFP');
        }
    } else if (user.role.name === 'Supplier') {
        if (rfp.status.code !== 'Published') {
            throw new Error('You are not authorized to view this RFP');
        }
    }

    return rfp;
};

export const updateRfp = async (rfpId: string, rfpData: CreateRfpData, userId: string) => {
    const rfp = await prisma.rFP.findUnique({
        where: { id: rfpId },
        include: { status: true },
    });

    if (!rfp) {
        throw new Error('RFP not found');
    }

    if (rfp.buyer_id !== userId) {
        throw new Error('You are not authorized to update this RFP');
    }

    if (rfp.status.code !== 'Draft') {
        throw new Error('RFP cannot be updated in current status');
    }

    const { title, description, requirements, budget_min, budget_max, deadline, notes } = rfpData;

    const updatedRfp = await prisma.rFP.update({
        where: { id: rfpId },
        data: {
            title,
            current_version: {
                update: {
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
            current_version: true,
            status: true,
        },
    });

    return updatedRfp;
};

export const deleteRfp = async (rfpId: string, userId: string) => {
    const rfp = await prisma.rFP.findUnique({
        where: { id: rfpId },
        include: { status: true },
    });

    if (!rfp) {
        throw new Error('RFP not found');
    }

    if (rfp.buyer_id !== userId) {
        throw new Error('You are not authorized to delete this RFP');
    }

    if (rfp.status.code !== 'Draft') {
        throw new Error('RFP cannot be deleted in current status');
    }

    await prisma.rFP.delete({
        where: { id: rfpId },
    });
};

export const publishRfp = async (rFPId: string, userId: string) => {
    const rFP = await prisma.rFP.findUnique({
        where: { id: rFPId },
        include: { status: true },
    });

    if (!rFP) {
        throw new Error('RFP not found');
    }

    if (rFP.buyer_id !== userId) {
        throw new Error('You are not authorized to publish this RFP');
    }

    if (rFP.status.code !== 'Draft') {
        throw new Error('RFP can only be published from Draft status');
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
        include: {
            status: true,
        },
    });

    // Send email notification to all suppliers
    await sendRfpPublishedNotification(rFPId);

    // Send real-time notification to all suppliers
    const rfpWithDetails = await prisma.rFP.findUnique({
        where: { id: rFPId },
        include: {
            current_version: true,
            buyer: true,
        },
    });
    if (rfpWithDetails) {
        notifyRfpPublished(rfpWithDetails);
    }

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
            current_version: {
                include: {
                    documents: true, // Include documents for the current version
                },
            },
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
        include: { status: true },
    });

    if (!rFP) {
        throw new Error('RFP not found');
    }

    if (rFP.status.code !== 'Published') {
        throw new Error('You can only respond to published RFPs');
    }

    // Check if supplier already has a response for this RFP
    const existingResponse = await prisma.supplierResponse.findFirst({
        where: {
            rfp_id: rFPId,
            supplier_id: supplierId,
        },
    });

    if (existingResponse) {
        throw new Error('You have already responded to this RFP');
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
        include: {
            rfp: {
                include: {
                    current_version: true,
                    status: true,
                },
            },
            status: true,
        },
    });

    return response;
};

export const submitDraftResponse = async (responseId: string, userId: string) => {
    const response = await prisma.supplierResponse.findUnique({
        where: { id: responseId },
        include: { status: true },
    });

    if (!response) {
        throw new Error('Response not found');
    }

    if (response.supplier_id !== userId) {
        throw new Error('You are not authorized to submit this response');
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
            include: {
                status: true,
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

    // Send email notification to buyer
    await sendResponseSubmittedNotification(responseId);

    // Send real-time notification to buyer
    const responseWithDetails = await prisma.supplierResponse.findUnique({
        where: { id: responseId },
        include: {
            supplier: true,
            rfp: {
                include: {
                    current_version: true,
                    buyer: true,
                },
            },
        },
    });
    if (responseWithDetails) {
        notifyResponseSubmitted(responseWithDetails, responseWithDetails.rfp.buyer_id);
    }

    return updatedResponse;
};

export const getNBAResponses = async (rFPId: string, userId: string) => {
    const rFP = await prisma.rFP.findUnique({
        where: { id: rFPId },
    });

    if (!rFP) {
        throw new Error('RFP not found');
    }

    if (rFP.buyer_id !== userId) {
        throw new Error('You are not authorized to view responses for this RFP');
    }

    const responses = await prisma.supplierResponse.findMany({
        where: {
            rfp_id: rFPId,
        },
        include: {
            supplier: true,
            status: true,
            documents: true,
        },
    });

    return responses;
};

export const reviewRfpResponse = async (rfp_id: string, status: 'Approved' | 'Rejected', userId: string) => {
    const rfp = await prisma.rFP.findUnique({
        where: { id: rfp_id },
        include: { status: true },
    });

    if (!rfp) {
        throw new Error('RFP not found');
    }

    if (rfp.buyer_id !== userId) {
        throw new Error('You are not authorized to review responses for this RFP');
    }

    if (rfp.status.code !== 'Under Review') {
        throw new Error('RFP must be in Under Review status to approve/reject');
    }

    let updated_rfp;
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
            include: {
                status: true,
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
            include: {
                status: true,
            },
        });
    }

    // Send email notification to suppliers about status change
    await sendRfpStatusChangeNotification(rfp_id, status);

    // Send real-time notification to suppliers
    const rfpWithSuppliers = await prisma.rFP.findUnique({
        where: { id: rfp_id },
        include: {
            current_version: true,
            supplier_responses: {
                include: {
                    supplier: true,
                },
            },
        },
    });
    if (rfpWithSuppliers) {
        const supplierIds = rfpWithSuppliers.supplier_responses.map(response => response.supplier_id);
        notifyRfpStatusChanged(rfpWithSuppliers, supplierIds);
    }

    return updated_rfp;
};

export const uploadRfpDocument = async (rfp_version_id: string, userId: string, file: Express.Multer.File) => {
    const rFP_version = await prisma.rFPVersion.findUnique({
        where: { id: rfp_version_id },
        include: { rfp: true }
    });

    if (!rFP_version) {
        throw new Error('RFP Version not found');
    }

    if (rFP_version.rfp.buyer_id !== userId) {
        throw new Error('You are not authorized to upload documents for this RFP');
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

    if (response.supplier_id !== userId) {
        throw new Error('You are not authorized to upload documents for this response');
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

export const getMyResponses = async (
    userId: string,
    responseFilters: any,
    rfpFilters: any,
    offset: number,
    limit: number,
    search?: string
) => {
    const whereClause: any = {
        supplier_id: userId,
        ...responseFilters,
    };

    // Apply RFP filters to the related RFP
    if (Object.keys(rfpFilters).length > 0) {
        whereClause.rfp = { ...rfpFilters };
    }

    // Add search across response and RFP fields
    if (search) {
        whereClause.OR = [
            { cover_letter: { contains: search, mode: 'insensitive' } },
            { rfp: { title: { contains: search, mode: 'insensitive' } } },
        ];
    }

    const responses = await prisma.supplierResponse.findMany({
        where: whereClause,
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
            documents: true,
        },
        orderBy: { created_at: 'desc' },
    });

    const total = await prisma.supplierResponse.count({
        where: whereClause,
    });

    return { total, page: Math.floor(offset / limit) + 1, limit, data: responses };
};

export const getResponseById = async (responseId: string, userId: string) => {
    const response = await prisma.supplierResponse.findUnique({
        where: { id: responseId },
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
        throw new Error('Response not found');
    }

    // Check if user can view this response
    // Suppliers can view their own responses, Buyers can view responses to their RFPs
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
    });

    if (!user) {
        throw new Error('User not found');
    }

    if (user.role.name === 'Supplier') {
        if (response.supplier_id !== userId) {
            throw new Error('You are not authorized to view this response');
        }
    } else if (user.role.name === 'Buyer') {
        if (response.rfp.buyer_id !== userId) {
            throw new Error('You are not authorized to view this response');
        }
    }

    return response;
};

export const updateResponse = async (responseId: string, responseData: SubmitResponseData, userId: string) => {
    const response = await prisma.supplierResponse.findUnique({
        where: { id: responseId },
        include: { status: true },
    });

    if (!response) {
        throw new Error('Response not found');
    }

    if (response.supplier_id !== userId) {
        throw new Error('You are not authorized to update this response');
    }

    if (response.status.code !== 'Draft') {
        throw new Error('Response cannot be updated in current status');
    }

    const { proposed_budget, timeline, cover_letter } = responseData;

    const updatedResponse = await prisma.supplierResponse.update({
        where: { id: responseId },
        data: {
            proposed_budget,
            timeline,
            cover_letter,
        },
        include: {
            rfp: {
                include: {
                    current_version: true,
                    status: true,
                },
            },
            status: true,
        },
    });

    return updatedResponse;
};