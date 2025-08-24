import { PrismaClient } from '@prisma/client';
import { RFP_STATUS, RoleName, SUPPLIER_RESPONSE_STATUS } from '../utils/enum';

const prisma = new PrismaClient();

export const getDashboardData = async (userId: string, userRole: string) => {
    if (userRole === 'Buyer') {
        return await getBuyerDashboard(userId);
    } else if (userRole === 'Supplier') {
        return await getSupplierDashboard(userId);
    } else {
        throw new Error('Invalid user role');
    }
};

export const getDashboardStats = async (userId: string, userRole: string) => {
    if (userRole === 'Buyer') {
        return await getBuyerStats(userId);
    } else if (userRole === 'Supplier') {
        return await getSupplierStats(userId);
    } else {
        throw new Error('Invalid user role');
    }
};

const getBuyerDashboard = async (userId: string) => {
    // Get recent RFPs created by the buyer
    const recentRfps = await prisma.rFP.findMany({
        where: { buyer_id: userId , deleted_at: null },
        include: {
            current_version: true,
            status: true,
            supplier_responses: {
                include: {
                    supplier: true,
                    status: true,
                },
            },
        },
        orderBy: { created_at: 'desc' },
        take: 5,
    });

    // Get recent responses to buyer's RFPs
    const recentResponses = await prisma.supplierResponse.findMany({
        where: {
            rfp: { buyer_id: userId , deleted_at: null },
            status: { code: {
                not: SUPPLIER_RESPONSE_STATUS.Draft,
            } },
        },
        include: {
            supplier: true,
            rfp: {
                include: {
                    current_version: true,
                },
            },
            status: true,
        },
        orderBy: { created_at: 'desc' },
        take: 5,
    });

    return {
        recentRfps,
        recentResponses,
        role: 'Buyer',
    };
};

const getSupplierDashboard = async (userId: string) => {
    // Get recent RFPs the supplier can respond to
    const publishedRfps = await prisma.rFP.findMany({
        where: {
            deleted_at: null,
            status: { code: {
               in: [RFP_STATUS.Published],
            } },
            supplier_responses: {
                none: { supplier_id: userId },
            },
        },
        include: {
            current_version: true,
            status: true,
            buyer: true,
        },
        orderBy: { created_at: 'desc' },
        take: 5,
    });

    // Get supplier's recent responses
    const myResponses = await prisma.supplierResponse.findMany({
        where: { supplier_id: userId },
        include: {
            rfp: {
                include: {
                    current_version: true,
                    status: true,
                },
            },
            status: true,
        },
        orderBy: { created_at: 'desc' },
        take: 5,
    });

    return {
        publishedRfps,
        myResponses,
        role: 'Supplier',
    };
};

const getBuyerStats = async (userId: string) => {
    const [
        totalRfps,
        publishedRfps,
        draftRfps,
        closedRfps,
        awardedRfps,
        cancelledRfps,
        totalResponses,
        pendingResponses,
        approvedResponses,
        rejectedResponses,
        awardedResponses,
    ] = await Promise.all([
        // Total RFPs
        prisma.rFP.count({ where: { buyer_id: userId , deleted_at: null } }),
        
        // Published RFPs
        prisma.rFP.count({
            where: { buyer_id: userId, status: { code: RFP_STATUS.Published }, deleted_at: null },
        }),
        
        // Draft RFPs
        prisma.rFP.count({
            where: { buyer_id: userId, status: { code: RFP_STATUS.Draft }, deleted_at: null },
        }),
        
        // Closed RFPs
        prisma.rFP.count({
            where: { buyer_id: userId, status: { code: RFP_STATUS.Closed }, deleted_at: null },
        }),
        
        // Awarded RFPs
        prisma.rFP.count({
            where: { buyer_id: userId, status: { code: RFP_STATUS.Awarded }, deleted_at: null },
        }),
        
        // Cancelled RFPs
        prisma.rFP.count({
            where: { buyer_id: userId, status: { code: RFP_STATUS.Cancelled }, deleted_at: null },
        }),
        
        // Total responses to buyer's RFPs
        prisma.supplierResponse.count({
            where: { rfp: { buyer_id: userId , deleted_at: null } },
        }),
        
        // Pending responses (Under Review)
        prisma.supplierResponse.count({
            where: {
                rfp: { buyer_id: userId , deleted_at: null },
                status: { code: SUPPLIER_RESPONSE_STATUS.Under_Review },
            },
        }),
        
        // Approved responses
        prisma.supplierResponse.count({
            where: {
                rfp: { buyer_id: userId , deleted_at: null },
                status: { code: SUPPLIER_RESPONSE_STATUS.Approved },
            },
        }),
        
        // Rejected responses
        prisma.supplierResponse.count({
            where: {
                rfp: { buyer_id: userId , deleted_at: null },
                status: { code: SUPPLIER_RESPONSE_STATUS.Rejected },
            },
        }),
        
        // Awarded responses
        prisma.supplierResponse.count({
            where: {
                rfp: { buyer_id: userId , deleted_at: null },
                status: { code: SUPPLIER_RESPONSE_STATUS.Awarded },
            },
        }),
    ]);

    return {
        totalRfps,
        publishedRfps,
        draftRfps,
        closedRfps,
        awardedRfps,
        cancelledRfps,
        totalResponses,
        pendingResponses,
        approvedResponses,
        rejectedResponses,
        awardedResponses,
        role: RoleName.Buyer,
    };
};

const getSupplierStats = async (userId: string) => {
    const [
        totalResponses,
        draftResponses,
        submittedResponses,
        underReviewResponses,
        approvedResponses,
        rejectedResponses,
        awardedResponses,
        availableRfps,
    ] = await Promise.all([
        // Total responses
        prisma.supplierResponse.count({ where: { supplier_id: userId } }),
        
        // Draft responses
        prisma.supplierResponse.count({
            where: { supplier_id: userId, status: { code: SUPPLIER_RESPONSE_STATUS.Draft } },
        }),
        
        // Submitted responses
        prisma.supplierResponse.count({
            where: { supplier_id: userId, status: { code: SUPPLIER_RESPONSE_STATUS.Submitted } },
        }),
        
        // Under Review responses
        prisma.supplierResponse.count({
            where: { supplier_id: userId, status: { code: SUPPLIER_RESPONSE_STATUS.Under_Review } },
        }),
        
        // Approved responses
        prisma.supplierResponse.count({
            where: { supplier_id: userId, status: { code: SUPPLIER_RESPONSE_STATUS.Approved } },
        }),
        
        // Rejected responses
        prisma.supplierResponse.count({
            where: { supplier_id: userId, status: { code: SUPPLIER_RESPONSE_STATUS.Rejected } },
        }),
        
        // Awarded responses
        prisma.supplierResponse.count({
            where: { supplier_id: userId, status: { code: SUPPLIER_RESPONSE_STATUS.Awarded } },
        }),
        
        // Available RFPs to respond to
        prisma.rFP.count({
            where: {
                deleted_at: null,
                status: { code: RFP_STATUS.Published },
                supplier_responses: {
                    none: { supplier_id: userId },
                },
            },
        }),
    ]);

    return {
        totalResponses,
        draftResponses,
        submittedResponses,
        underReviewResponses,
        approvedResponses,
        rejectedResponses,
        awardedResponses,
        availableRfps,
        role: RoleName.Supplier,
    };
};
