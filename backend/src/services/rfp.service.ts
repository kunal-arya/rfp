import { PrismaClient, User } from '@prisma/client';
import { CreateRfpData, SubmitResponseData } from '../validations/rfp.validation';
import { uploadToCloudinary } from '../utils/cloudinary';
import { RFP_STATUS, RoleName, SUPPLIER_RESPONSE_STATUS } from '../utils/enum';
import { sendRfpPublishedNotification, sendResponseSubmittedNotification, sendRfpStatusChangeNotification, sendResponseMovedToReviewNotification, sendResponseApprovedNotification, sendResponseRejectedNotification, sendResponseAwardedNotification } from './email.service';
import { notificationService } from './notification.service';
import { notifyRfpPublished, notifyResponseSubmitted, notifyRfpStatusChanged, notifyRfpCreated, notifyRfpUpdated, notifyRfpDeleted, notifyResponseMovedToReview, notifyResponseApproved, notifyResponseRejected, notifyResponseAwarded, notifyRfpAwarded } from './websocket.service';
import { createAuditEntry, AUDIT_ACTIONS } from './audit.service';

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

    let updateRfp: any;

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

    if (updateRfp) {
        // Create audit trail entry
        await createAuditEntry(buyerId, AUDIT_ACTIONS.RFP_CREATED, 'RFP', updateRfp.id, {
            title: updateRfp.title,
            status: updateRfp.status.code,
        });

        // Send real-time notification to buyer
        notifyRfpCreated(updateRfp);
    }

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
        where: { ...whereClause, deleted_at: null },
        skip: offset,
        take: limit,
        include: {
            current_version: {
                include: {
                    documents: {
                        where: { deleted_at: null }, // Exclude soft-deleted documents
                    },
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
        where: { ...whereClause, deleted_at: null },
    });

    return { total, page: Math.floor(offset / limit) + 1, limit, data: rfps };
};

export const getRfpById = async (rfpId: string, userId: string) => {
    const rfp = await prisma.rFP.findUnique({
        where: { id: rfpId, deleted_at: null },
        include: {
            current_version: {
                include: {
                    documents: {
                        where: { deleted_at: null }, // Exclude soft-deleted documents
                    },
                },
            },
            versions: {
                orderBy: { version_number: 'desc' },
                include: {
                    documents: {
                        where: { deleted_at: null },
                    },
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

    return rfp;
};

export const getRfpVersions = async (rfpId: string, userId: string) => {
    const rfp = await prisma.rFP.findUnique({
        where: { id: rfpId, deleted_at: null },
        include: {
            versions: {
                orderBy: { version_number: 'desc' },
                include: {
                    documents: {
                        where: { deleted_at: null },
                    },
                },
            },
            current_version: true,
            status: true,
            buyer: true,
        },
    });

    if (!rfp) {
        throw new Error('RFP not found');
    }

    if (rfp.buyer_id !== userId) {
        throw new Error('You are not authorized to view versions of this RFP');
    }

    return rfp.versions;
};

export const switchRfpVersion = async (rfpId: string, versionId: string, userId: string) => {
    const rfp = await prisma.rFP.findUnique({
        where: { id: rfpId, deleted_at: null },
        include: {
            status: true,
            versions: {
                where: { id: versionId },
                include: {
                    documents: {
                        where: { deleted_at: null },
                    },
                },
            },
        },
    });

    if (!rfp) {
        throw new Error('RFP not found');
    }

    if (rfp.buyer_id !== userId) {
        throw new Error('You are not authorized to switch versions of this RFP');
    }

    // Only allow version switching for Draft RFPs
    if (rfp.status.code !== 'Draft') {
        throw new Error('RFP versions can only be switched for Draft RFPs');
    }

    if (rfp.versions.length === 0) {
        throw new Error('Version not found');
    }

    const selectedVersion = rfp.versions[0];

    const updatedRfp = await prisma.rFP.update({
        where: { id: rfpId, deleted_at: null },
        data: {
            current_version_id: selectedVersion.id,
        },
        include: {
            current_version: {
                include: {
                    documents: true,
                },
            },
            versions: {
                orderBy: { version_number: 'desc' },
                include: {
                    documents: true,
                },
            },
            status: true,
            buyer: true,
        },
    });

    // Create audit trail entry
    await createAuditEntry(userId, AUDIT_ACTIONS.RFP_UPDATED, 'RFP', rfpId, {
        title: updatedRfp.title,
        version_switched_to: selectedVersion.version_number,
        previous_version: updatedRfp.current_version?.version_number,
    });

    return updatedRfp;
};

export const createRfpVersion = async (rfpId: string, rfpData: CreateRfpData, userId: string) => {
    const rfp = await prisma.rFP.findUnique({
        where: { id: rfpId, deleted_at: null },
        include: { 
            status: true,
            current_version: true,
            versions: {
                orderBy: { version_number: 'desc' },
                take: 1
            }
        },
    });

    if (!rfp) {
        throw new Error('RFP not found');
    }

    if (rfp.buyer_id !== userId) {
        throw new Error('You are not authorized to create versions for this RFP');
    }

    // Only allow versioning for Draft RFPs
    if (rfp.status.code !== 'Draft') {
        throw new Error('RFP versions can only be created for Draft RFPs');
    }

    const { title, description, requirements, budget_min, budget_max, deadline, notes } = rfpData;

    // Get the next version number
    const nextVersionNumber = rfp.versions.length > 0 ? rfp.versions[0].version_number + 1 : 1;

    const updatedRfp = await prisma.$transaction(async (tx) => {
        // Create new version
        const newVersion = await tx.rFPVersion.create({
            data: {
                rfp_id: rfpId,
                version_number: nextVersionNumber,
                description,
                requirements,
                budget_min,
                budget_max,
                deadline,
                notes,
            },
        });

        // Update RFP title and set new version as current
        const updatedRfp = await tx.rFP.update({
            where: { id: rfpId, deleted_at: null },
            data: {
                title,
                current_version_id: newVersion.id,
            },
            include: {
                current_version: true,
                status: true,
                buyer: true,
                versions: {
                    orderBy: { version_number: 'desc' }
                }
            },
        });

        return updatedRfp;
    });

    // Send real-time notification to buyer
    notifyRfpUpdated(updatedRfp);

    // Create audit trail entry
    await createAuditEntry(userId, AUDIT_ACTIONS.RFP_UPDATED, 'RFP', rfpId, {
        title: updatedRfp.title,
        version_number: nextVersionNumber,
        description: updatedRfp.current_version?.description,
        requirements: updatedRfp.current_version?.requirements,
        budget_min: updatedRfp.current_version?.budget_min,
        budget_max: updatedRfp.current_version?.budget_max,
        deadline: updatedRfp.current_version?.deadline,
        notes: updatedRfp.current_version?.notes,
    });

    return updatedRfp;
};

export const updateRfp = async (rfpId: string, rfpData: CreateRfpData, userId: string) => {
    const rfp = await prisma.rFP.findUnique({
        where: { id: rfpId, deleted_at: null },
        include: { 
            status: true,
            current_version: true 
        },
    });

    if (!rfp) {
        throw new Error('RFP not found');
    }

    if (rfp.buyer_id !== userId) {
        throw new Error('You are not authorized to update this RFP');
    }

    // For Draft RFPs, create a new version
    if (rfp.status.code === 'Draft') {
        return await createRfpVersion(rfpId, rfpData, userId);
    }

    // For published RFPs, only allow minor updates to current version
    const { title, description, requirements, budget_min, budget_max, deadline, notes } = rfpData;

    const updatedRfp = await prisma.rFP.update({
        where: { id: rfpId, deleted_at: null },
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
            buyer: true,
        },
    });
    
    // Send real-time notification to buyer
    notifyRfpUpdated(updatedRfp);

    // Create audit trail entry
    await createAuditEntry(userId, AUDIT_ACTIONS.RFP_UPDATED, 'RFP', rfpId, {
        title: updatedRfp.title,
        description: updatedRfp.current_version?.description,
        requirements: updatedRfp.current_version?.requirements,
        budget_min: updatedRfp.current_version?.budget_min,
        budget_max: updatedRfp.current_version?.budget_max,
        deadline: updatedRfp.current_version?.deadline,
        notes: updatedRfp.current_version?.notes,
    });

    return updatedRfp;
};

export const deleteRfp = async (rfpId: string, userId: string) => {
    const rfp = await prisma.rFP.findUnique({
        where: { id: rfpId , deleted_at: null },
        include: { status: true },
    });

    if (!rfp) {
        throw new Error('RFP not found');
    }

    await prisma.rFP.update({
        where: { id: rfpId , deleted_at: null   },
        data: {
            deleted_at: new Date(),
        },
    });

    // Send real-time notification to buyer
    notifyRfpDeleted(rfp);

    // Create audit trail entry
    await createAuditEntry(userId, AUDIT_ACTIONS.RFP_DELETED, 'RFP', rfpId, {
        title: rfp.title,
    });
};

export const publishRfp = async (rFPId: string, userId: string) => {
    const rFP = await prisma.rFP.findUnique({
        where: { id: rFPId , deleted_at: null },
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
        where: { id: rFPId , deleted_at: null },
        data: {
            status_id: publishedStatus.id,
        },
        include: {
            status: true,
            buyer: true,
            current_version: true,
        },
    });

    // Send email notification to all suppliers
    await sendRfpPublishedNotification(rFPId);

    // Create in-app notifications for all suppliers
    const rfpWithDetails = await prisma.rFP.findUnique({
        where: { id: rFPId , deleted_at: null },
        include: {
            current_version: true,
            buyer: true,
        },
    });
    
    if (rfpWithDetails) {
        // Create notifications for all suppliers
        await notificationService.createNotificationForRole('Supplier', 'RFP_PUBLISHED', {
            rfp_title: rfpWithDetails.title,
            buyer_name: rfpWithDetails.buyer.email,
            deadline: rfpWithDetails.current_version?.deadline ? new Date(rfpWithDetails.current_version.deadline).toLocaleDateString() : 'N/A',
            rfp_id: rfpWithDetails.id
        });

        // Send real-time notification to all suppliers and buyer
        notifyRfpPublished(rfpWithDetails);

        // Create audit trail entry
        await createAuditEntry(userId, AUDIT_ACTIONS.RFP_PUBLISHED, 'RFP', rFPId, {
            title: rfpWithDetails.title,
            previous_status: 'Draft',
            new_status: 'Published',
        });
    }

    return updatedRfp;
};

export const closeRfp = async (rFPId: string, buyerId: string) => {
    const rFP = await prisma.rFP.findUnique({
        where: { id: rFPId , deleted_at: null },
        include: {
            status: true,
            buyer: true,
            current_version: true,
        },
    });

    if (!rFP) {
        throw new Error('RFP not found');
    }

    if (rFP.buyer_id !== buyerId) {
        throw new Error('You are not authorized to close this RFP');
    }

    if (rFP.status.code !== 'Published') {
        throw new Error('RFP cannot be closed in current status');
    }

    const closedStatus = await prisma.rFPStatus.findUnique({
        where: { code: RFP_STATUS.Closed },
    });

    if (!closedStatus) {
        throw new Error('Closed status not found');
    }

    const updatedRfp = await prisma.rFP.update({
        where: { id: rFPId , deleted_at: null },
        data: { 
            status_id: closedStatus.id,
            closed_at: new Date(),
        },
        include: {
            status: true,
            buyer: true,
            current_version: true,
        },
    });

    // Create audit trail entry
    await createAuditEntry(buyerId, AUDIT_ACTIONS.RFP_STATUS_CHANGED, 'RFP', updatedRfp.id, {
        title: updatedRfp.title,
        previous_status: rFP.status.code,
        new_status: updatedRfp.status.code,
    });

    return updatedRfp;
};

export const cancelRfp = async (rFPId: string, buyerId: string) => {
    const rFP = await prisma.rFP.findUnique({
        where: { id: rFPId , deleted_at: null },
        include: {
            status: true,
            buyer: true,
            current_version: true,
        },
    });

    if (!rFP) {
        throw new Error('RFP not found');
    }

    if (rFP.buyer_id !== buyerId) {
        throw new Error('You are not authorized to cancel this RFP');
    }

    if (!['Draft', 'Published'].includes(rFP.status.code)) {
        throw new Error('RFP cannot be cancelled in current status');
    }

    const cancelledStatus = await prisma.rFPStatus.findUnique({
        where: { code: RFP_STATUS.Cancelled },
    });

    if (!cancelledStatus) {
        throw new Error('Cancelled status not found');
    }

    const updatedRfp = await prisma.rFP.update({
        where: { id: rFPId , deleted_at: null },
        data: { status_id: cancelledStatus.id },
        include: {
            status: true,
            buyer: true,
            current_version: true,
        },
    });

    // Create audit trail entry
    await createAuditEntry(buyerId, AUDIT_ACTIONS.RFP_STATUS_CHANGED, 'RFP', updatedRfp.id, {
        title: updatedRfp.title,
        previous_status: rFP.status.code,
        new_status: updatedRfp.status.code,
    });

    return updatedRfp;
};

export const awardRfp = async (rFPId: string, responseId: string, buyerId: string) => {
    const rFP = await prisma.rFP.findUnique({
        where: { id: rFPId , deleted_at: null },
        include: {
            status: true,
            buyer: true,
            current_version: true,
        },
    });

    if (!rFP) {
        throw new Error('RFP not found');
    }

    if (rFP.buyer_id !== buyerId) {
        throw new Error('You are not authorized to award this RFP');
    }

    if (!['Published', 'Closed'].includes(rFP.status.code)) {
        throw new Error('RFP cannot be awarded in current status');
    }

    const response = await prisma.supplierResponse.findUnique({
        where: { id: responseId },
        include: {
            status: true,
            supplier: true,
        },
    });

    if (!response) {
        throw new Error('Response not found');
    }

    if (response.rfp_id !== rFPId) {
        throw new Error('Response does not belong to this RFP');
    }

    if (response.status.code !== SUPPLIER_RESPONSE_STATUS.Approved) {
        throw new Error('Response is not approved');
    }

    const awardedStatus = await prisma.rFPStatus.findUnique({
        where: { code: RFP_STATUS.Awarded },
    });

    if (!awardedStatus) {
        throw new Error('Awarded status not found');
    }

    // First, award the response (this will update response status and send notifications)
    const awardedResponseRfp = await awardResponse(responseId, buyerId);

    const { updatedResponse: awardedResponse, updatedRfp } = awardedResponseRfp;

    // Get all suppliers who responded to this RFP for notifications
    const rfpWithSuppliers = await prisma.rFP.findUnique({
        where: { id: rFPId },
        include: {
            supplier_responses: {
                include: {
                    supplier: true,
                },
            },
        },
    });

    // Send WebSocket notifications to all suppliers who responded
    if (rfpWithSuppliers) {
        const supplierIds = rfpWithSuppliers.supplier_responses.map(response => response.supplier_id);
        notifyRfpAwarded(updatedRfp, supplierIds);
    }

    // Create notification for all suppliers who responded
    if (rfpWithSuppliers) {
        for (const response of rfpWithSuppliers.supplier_responses) {
            if (response.supplier_id === awardedResponse.supplier_id) {
                // Winner notification is already sent by awardResponse function
                continue;
            }
            
            // Notify other suppliers that RFP was awarded to someone else
            await notificationService.createNotificationForUser(response.supplier_id, "RFP_AWARDED", {
                rfp_title: updatedRfp.title,
                supplier_name: response.supplier.email,
                rfp_id: updatedRfp.id
            });
        }
    }

    // Create audit trail entry for RFP status change
    await createAuditEntry(buyerId, AUDIT_ACTIONS.RFP_STATUS_CHANGED, 'RFP', updatedRfp.id, {
        title: updatedRfp.title,
        previous_status: rFP.status.code,
        new_status: updatedRfp.status.code,
        awarded_response_id: responseId,
    });

    return updatedRfp;
};

export const getAllRfps = async (
    rfpFilters: any,
    versionFilters: any,
    offset: number,
    limit: number,
    search?: string,
    user?: any,
    show_new_rfps?: any
) => {

    if (user?.role === RoleName.Supplier && show_new_rfps) {
        const newRfps = await getNewRfpsForSupplierService(user.userId);
        return { total: newRfps.length, page: 1, limit: newRfps.length, data: newRfps };
    }
    
    // Apply version filters to current_version
    if (Object.keys(versionFilters).length > 0) {
        rfpFilters.current_version = { ...versionFilters };
    }

    // Initialize base where conditions
    const baseWhere: any = {
        deleted_at: null,
    };

    // Add search across RFP and current_version fields
    if (search) {
        baseWhere.OR = [ // Use OR for search terms
            { title: { contains: search, mode: 'insensitive' } },
            { current_version: { description: { contains: search, mode: 'insensitive' } } },
            { current_version: { requirements: { contains: search, mode: 'insensitive' } } },
            { buyer: { name: { contains: search, mode: 'insensitive' } } }
        ];
    }

    // Apply supplier-specific logic
    if (user?.role === RoleName.Supplier) {
        // Use OR to combine the two conditions for suppliers
        baseWhere.AND = [ // Combine supplier-specific OR with other filters using AND
            baseWhere.AND || {}, // Preserve existing AND conditions if any (e.g., from search)
            {
                OR: [
                    // Condition 1: RFPs the supplier has responded to (not draft)
                    {
                        status: {
                            code: {
                                not: RFP_STATUS.Draft,
                            },
                        },
                        supplier_responses: {
                            some: {
                                supplier_id: user.userId,
                            },
                        },
                    },
                    // Condition 2: Published RFPs the supplier has NOT responded to
                    {
                        status: {
                            code: RFP_STATUS.Published,
                        },
                        supplier_responses: {
                            none: {
                                supplier_id: user.userId,
                            },
                        },
                    },
                ],
            },
        ];
    }

    // Merge rfpFilters last, ensuring they don't overwrite the OR/AND logic
    // This assumes rfpFilters are additional AND conditions
    Object.assign(baseWhere, rfpFilters);


    const rfps = await prisma.rFP.findMany({
        where: baseWhere,
        skip: offset,
        take: limit,
        include: {
            current_version: {
                include: {
                    documents: {
                        where: { deleted_at: null }, // Exclude soft-deleted documents
                    },
                },
            },
            status: true,
            buyer: true,
            supplier_responses: true
        },
        orderBy: { created_at: 'desc' }
    });

    const total = await prisma.rFP.count({
        where: baseWhere // Use the same baseWhere for total count
    });

    return { total, page: Math.floor(offset / limit) + 1, limit, data: rfps };
};

async function getNewRfpsForSupplierService(supplierId: string) {
    return prisma.rFP.findMany({
      where: {
        status: {
          code: RFP_STATUS.Published,
        },
        supplier_responses: {
          none: {
            supplier_id: supplierId,
          }
        }
      },
      include: {
        current_version: {
            include: {
                documents: {
                    where: { deleted_at: null }, // Exclude soft-deleted documents
                },
            },
        },
        status: true,
        buyer: true,
        supplier_responses: true
      },
      orderBy: { created_at: 'desc' },
    });
  }  

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

    // Create audit trail entry
    await createAuditEntry(supplierId, AUDIT_ACTIONS.RESPONSE_CREATED, 'SupplierResponse', response.id, {
        rfp_id: rFPId,
        rfp_title: response.rfp.title,
        status: response.status.code,
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

    const updatedResponse = await prisma.supplierResponse.update({
        where: { id: responseId },
        data: {
            status_id: submittedStatus.id,
        },
        include: {
            status: true,
            supplier: true,
            documents: true,
            rfp: true,
        },
    });

    // Send email notification to buyer
    await sendResponseSubmittedNotification(responseId);

    // Create in-app notification for buyer
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
        // Create notification for the buyer
        await notificationService.createNotificationForUser(responseWithDetails.rfp.buyer_id, 'RESPONSE_SUBMITTED', {
            rfp_title: responseWithDetails.rfp.title,
            supplier_name: responseWithDetails.supplier.email,
            response_id: responseWithDetails.id
        });

        // Send real-time notification to buyer
        notifyResponseSubmitted(responseWithDetails, responseWithDetails.rfp.buyer_id);

        // Create audit trail entry
        await createAuditEntry(userId, AUDIT_ACTIONS.RESPONSE_SUBMITTED, 'SupplierResponse', responseId, {
            rfp_id: response.rfp_id,
            rfp_title: responseWithDetails.rfp.title,
            previous_status: 'Draft',
            new_status: 'Submitted',
        });
    }

    return updatedResponse;
};

export const moveResponseToReview = async (responseId: string, buyerId: string) => {
    const response = await prisma.supplierResponse.findUnique({
        where: { id: responseId },
        include: {
            status: true,
            supplier: true,
            rfp: {
                include: {
                    buyer: true,
                },
            },
        },
    });

    if (!response) {
        throw new Error('Response not found');
    }

    if (response.status.code !== SUPPLIER_RESPONSE_STATUS.Submitted) {
        throw new Error('Response cannot be moved to review in current status');
    }

    const underReviewStatus = await prisma.supplierResponseStatus.findUnique({
        where: { code: SUPPLIER_RESPONSE_STATUS.Under_Review },
    });

    if (!underReviewStatus) {
        throw new Error('Under Review status not found');
    }

    const updatedResponse = await prisma.supplierResponse.update({
        where: { id: responseId },
        data: {
            status_id: underReviewStatus.id,
            reviewed_at: new Date(),
        },
        include: {
            status: true,
            supplier: true,
            rfp: {
                include: {
                    buyer: true,
                },
            },
        },
    });

    // Create audit trail entry
    await createAuditEntry(buyerId, AUDIT_ACTIONS.RESPONSE_MOVED_TO_REVIEW, 'SupplierResponse', responseId, {
        rfp_id: response.rfp_id,
        rfp_title: response.rfp.title,
        previous_status: 'Submitted',
        new_status: 'Under Review',
    });

    // Send real-time notification to the supplier
    notifyResponseMovedToReview(updatedResponse, updatedResponse.supplier_id);

    // Send email notification to supplier
    await sendResponseMovedToReviewNotification(responseId);

    // Create notification for the supplier
    await notificationService.createNotificationForUser(updatedResponse.supplier_id, 'RESPONSE_MOVED_TO_REVIEW', {
        rfp_title: updatedResponse.rfp.title,
        supplier_name: updatedResponse.supplier.email,
        response_id: updatedResponse.id
    });

    return updatedResponse;
};

export const approveResponse = async (responseId: string, buyerId: string) => {
    const response = await prisma.supplierResponse.findUnique({
        where: { id: responseId },
        include: {
            status: true,
            supplier: true,
            rfp: {
                include: {
                    buyer: true,
                },
            },
        },
    });

    if (!response) {
        throw new Error('Response not found');
    }

    if (response.rfp.buyer_id !== buyerId) {
        throw new Error('You are not authorized to approve this response');
    }

    if (response.status.code !== SUPPLIER_RESPONSE_STATUS.Under_Review) {
        throw new Error('Response cannot be approved in current status');
    }

    const approvedStatus = await prisma.supplierResponseStatus.findUnique({
        where: { code: SUPPLIER_RESPONSE_STATUS.Approved },
    });

    if (!approvedStatus) {
        throw new Error('Approved status not found');
    }

    const updatedResponse = await prisma.supplierResponse.update({
        where: { id: responseId },
        data: {
            status_id: approvedStatus.id,
            reviewed_at: new Date(),
        },
        include: {
            status: true,
            supplier: true,
            rfp: {
                include: {
                    buyer: true,
                },
            },
        },
    });

    // Create audit trail entry
    await createAuditEntry(buyerId, AUDIT_ACTIONS.RESPONSE_APPROVED, 'SupplierResponse', responseId, {
        rfp_id: response.rfp_id,
        rfp_title: response.rfp.title,
        previous_status: response.status.code,
        new_status: updatedResponse.status.code,
    });

    // Send real-time notification to supplier
    notifyResponseApproved(updatedResponse, updatedResponse.supplier_id);

    // Send email notification to supplier
    await sendResponseApprovedNotification(responseId);

    // Create notification for the supplier
    await notificationService.createNotificationForUser(updatedResponse.supplier_id, "RESPONSE_APPROVED", {
        rfp_title: updatedResponse.rfp.title,
        supplier_name: updatedResponse.supplier.email,
        response_id: updatedResponse.id
    });

    return updatedResponse;
};

export const rejectResponse = async (responseId: string, rejectionReason: string, buyerId: string) => {
    const response = await prisma.supplierResponse.findUnique({
        where: { id: responseId },
        include: {
            status: true,
            supplier: true,
            rfp: {
                include: {
                    buyer: true,
                },
            },
        },
    });

    if (!response) {
        throw new Error('Response not found');
    }

    if (response.rfp.buyer_id !== buyerId) {
        throw new Error('You are not authorized to reject this response');
    }

    if (response.status.code !== SUPPLIER_RESPONSE_STATUS.Under_Review) {
        throw new Error('Response cannot be rejected in current status');
    }

    const rejectedStatus = await prisma.supplierResponseStatus.findUnique({
        where: { code: SUPPLIER_RESPONSE_STATUS.Rejected },
    });

    if (!rejectedStatus) {
        throw new Error('Rejected status not found');
    }

    const updatedResponse = await prisma.supplierResponse.update({
        where: { id: responseId },
        data: {
            status_id: rejectedStatus.id,
            rejection_reason: rejectionReason,
            reviewed_at: new Date(),
        },
        include: {
            status: true,
            supplier: true,
            rfp: {
                include: {
                    buyer: true,
                },
            },
        },
    });

    // Send real-time notification to supplier
    notifyResponseRejected(updatedResponse, updatedResponse.supplier_id);

    // Send email notification to supplier
    await sendResponseRejectedNotification(responseId, rejectionReason);

    // Create notification for the supplier
    await notificationService.createNotificationForUser(updatedResponse.supplier_id, "RESPONSE_REJECTED", {
        rfp_title: updatedResponse.rfp.title,
        supplier_name: updatedResponse.supplier.email,
        response_id: updatedResponse.id,
        rejection_reason: rejectionReason
    });

    // Create audit trail entry
    await createAuditEntry(buyerId, AUDIT_ACTIONS.RESPONSE_REJECTED, 'SupplierResponse', responseId, {
        rfp_id: response.rfp_id,
        rfp_title: response.rfp.title,
        previous_status: response.status.code,
        new_status: updatedResponse.status.code,
        rejection_reason: rejectionReason,
    });

    return updatedResponse;
};

export const awardResponse = async (responseId: string, buyerId: string) => {
    const response = await prisma.supplierResponse.findUnique({
        where: { id: responseId },
        include: {
            status: true,
            supplier: true,
            rfp: {
                include: {
                    buyer: true,
                },
            },
        },
    });

    if (!response) {
        throw new Error('Response not found');
    }

    if (response.rfp.buyer_id !== buyerId) {
        throw new Error('You are not authorized to award this response');
    }

    if (response.status.code !== SUPPLIER_RESPONSE_STATUS.Approved) {
        throw new Error('Response cannot be awarded in current status');
    }

    // Check if another response has already been awarded for this RFP
    const existingAwardedResponse = await prisma.rFP.findFirst({
        where: {
            id: response.rfp_id,
            awarded_response_id: { not: null },
        },
    });

    if (existingAwardedResponse) {
        throw new Error('Another response has already been awarded for this RFP');
    }

    const awardedStatus = await prisma.supplierResponseStatus.findUnique({
        where: { code: SUPPLIER_RESPONSE_STATUS.Awarded },
    });

    if (!awardedStatus) {
        throw new Error('Awarded status not found');
    }

    const updatedResponseRfp = await prisma.$transaction(async (tx) => {
        const updatedResponse = await tx.supplierResponse.update({
            where: { id: responseId },
            data: {
                status_id: awardedStatus.id,
                decided_at: new Date(),
            },
            include: {
                status: true,
                supplier: true,
                rfp: {
                    include: {
                        buyer: true,
                    },
                },
            },
        });

        const rfpawardedStatus = await prisma.rFPStatus.findUnique({
            where: { code: RFP_STATUS.Awarded },
        });
    
        if (!rfpawardedStatus) {
            throw new Error('Awarded status not found');
        }    

        const updatedRfp = await tx.rFP.update({
            where: { id: response.rfp_id },
            data: {
                awarded_response_id: updatedResponse.id,
                awarded_at: new Date(),
                status_id: rfpawardedStatus.id,
            },
            include: {
                status: true,
                buyer: true,
                current_version: true,
                awarded_response: {
                    include: {
                        supplier: true,
                        status: true,
                    },
                },
            },
        });

        return { updatedResponse, updatedRfp };
    });

    const { updatedResponse, updatedRfp } = updatedResponseRfp;

    // Send real-time notification to supplier
    notifyResponseAwarded(updatedResponse, updatedResponse.supplier_id);

    // Send email notification to supplier
    await sendResponseAwardedNotification(responseId);

    // Create notification for the supplier
    await notificationService.createNotificationForUser(updatedResponse.supplier_id, "RESPONSE_AWARDED", {
        rfp_title: updatedResponse.rfp.title,
        supplier_name: updatedResponse.supplier.email,
        response_id: updatedResponse.id
    });

    // Create audit trail entry
    await createAuditEntry(buyerId, AUDIT_ACTIONS.RESPONSE_AWARDED, 'SupplierResponse', responseId, {
        rfp_id: response.rfp_id,
        rfp_title: response.rfp.title,
        previous_status: response.status.code,
        new_status: updatedResponse.status.code,
    });

    return updatedResponseRfp
};

export const getNBAResponses = async (rFPId: string, userId: string, user_role: string) => {
    const rFP = await prisma.rFP.findUnique({
        where: { id: rFPId , deleted_at: null },
    });

    if (!rFP) {
        throw new Error('RFP not found');
    }

    const isSupplier = user_role === RoleName.Supplier;
    const isBuyer = user_role === RoleName.Buyer;

    // Check authorization
    if (isSupplier) {
        // Suppliers can only see their own responses
        const responses = await prisma.supplierResponse.findMany({
            where: {
                rfp_id: rFPId,
                supplier_id: userId
            },
            include: {
                supplier: true,
                status: true,
                documents: true,
            },
        });
        return responses;
    } else if (isBuyer) {        
        const responses = await prisma.supplierResponse.findMany({
            where: {
                rfp_id: rFPId,
                status: {
                    code: {
                        not: SUPPLIER_RESPONSE_STATUS.Draft
                    }
                }
            },
            include: {
                supplier: true,
                status: true,
                documents: true,
            },
        });
        return responses;
    }

    return [];
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

    if (rfp.status.code !== SUPPLIER_RESPONSE_STATUS.Under_Review) {
        throw new Error('RFP must be in Under Review status to approve/reject');
    }

    let updated_rfp;
    if (status === 'Approved') {
        const rfpApprovedStatus = await prisma.rFPStatus.findUnique({
            where: { code: SUPPLIER_RESPONSE_STATUS.Approved },
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
            where: { code: SUPPLIER_RESPONSE_STATUS.Rejected },
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

    if(file.buffer.length === 0) {
        throw new Error('File buffer is empty');
    }
   
    const uploadResult = await uploadToCloudinary(file.buffer,file.mimetype);

    const document = await prisma.document.create({
        data: {
            file_name: file.originalname,
            url: uploadResult.secure_url,
            rfp_version_id: rfp_version_id,
            uploader_id: userId
        },
        include: {
            rfp_version: true,
        },
    });

    // Create audit trail entry
    await createAuditEntry(userId, AUDIT_ACTIONS.DOCUMENT_UPLOADED, 'Document', document.id, {
        file_name: file.originalname,
        target_type: 'RFP',
        target_id: rfp_version_id,
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

    const uploadResult = await uploadToCloudinary(file.buffer, file.mimetype);

    const document = await prisma.document.create({
        data: {
            file_name: file.originalname,
            url: uploadResult.secure_url,
            rfp_response_id: responseId,
            uploader_id: userId
        },
    });

    // Create audit trail entry
    await createAuditEntry(userId, AUDIT_ACTIONS.DOCUMENT_UPLOADED, 'Document', document.id, {
        file_name: file.originalname,
        target_type: 'Response',
        target_id: responseId,
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
            supplier: true,
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

export const deleteDocument = async (documentId: string, type: string, parentId: string, userId: string) => {
    // First, find the document
    const document = await prisma.document.findUnique({
        where: { 
            id: documentId,
            deleted_at: null, // Only find non-deleted documents
        },
        include: {
            rfp_version: {
                include: {
                    rfp: true,
                },
            },
            rfp_response: {
                include: {
                    rfp: true,
                },
            },
        },
    });

    if (!document) {
        throw new Error('Document not found');
    }

    // Check authorization based on document type
    if (type === 'rfp') {
        if (!document.rfp_version) {
            throw new Error('Document not found');
        }
        
        // Check if user owns the RFP
        if (document.rfp_version.rfp.buyer_id !== userId) {
            throw new Error('You are not authorized to delete this document');
        }

        // Verify parentId matches
        if (document.rfp_version_id !== parentId) {
            throw new Error('Document not found');
        }
    } else if (type === 'response') {
        if (!document.rfp_response) {
            throw new Error('Document not found');
        }
        
        // Check if user owns the response
        if (document.rfp_response.supplier_id !== userId) {
            throw new Error('You are not authorized to delete this document');
        }

        // Verify parentId matches
        if (document.rfp_response_id !== parentId) {
            throw new Error('Document not found');
        }
    }

    // Soft delete the document
    await prisma.document.update({
        where: { id: documentId },
        data: { deleted_at: new Date() },
    });

    // Create audit trail entry
    await createAuditEntry(userId, AUDIT_ACTIONS.DOCUMENT_DELETED, 'Document', documentId, {
        file_name: document.file_name,
        target_type: type,
        target_id: parentId,
    });

    return { message: 'Document deleted successfully' };
};