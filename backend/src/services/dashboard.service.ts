import { PrismaClient } from '@prisma/client';
import { RFP_STATUS, SUPPLIER_RESPONSE_STATUS } from '../utils/enum';

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
        where: { buyer_id: userId },
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
            rfp: { buyer_id: userId },
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

    // Get RFPs that need attention (published but no responses)
    const rfpsNeedingAttention = await prisma.rFP.findMany({
        where: {
            buyer_id: userId,
            status: { code: 'Published' },
            supplier_responses: { none: {} },
        },
        include: {
            current_version: true,
            status: true,
        },
        take: 5,
    });

    return {
        recentRfps,
        recentResponses,
        rfpsNeedingAttention,
        role: 'Buyer',
    };
};

const getSupplierDashboard = async (userId: string) => {
    // Get recent RFPs the supplier can respond to
    const availableRfps = await prisma.rFP.findMany({
        where: {
            status: { code: 'Published' },
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

    // Get responses that need attention (draft status)
    const responsesNeedingAttention = await prisma.supplierResponse.findMany({
        where: {
            supplier_id: userId,
            status: { code: 'Draft' },
        },
        include: {
            rfp: {
                include: {
                    current_version: true,
                },
            },
            status: true,
        },
        take: 5,
    });

    return {
        availableRfps,
        myResponses,
        responsesNeedingAttention,
        role: 'Supplier',
    };
};

const getBuyerStats = async (userId: string) => {
    const [
        totalRfps,
        publishedRfps,
        draftRfps,
        totalResponses,
        pendingResponses,
        approvedResponses,
        rejectedResponses,
    ] = await Promise.all([
        // Total RFPs
        prisma.rFP.count({ where: { buyer_id: userId } }),
        
        // Published RFPs
        prisma.rFP.count({
            where: { buyer_id: userId, status: { code: 'Published' } },
        }),
        
        // Draft RFPs
        prisma.rFP.count({
            where: { buyer_id: userId, status: { code: 'Draft' } },
        }),
        
        // Total responses to buyer's RFPs
        prisma.supplierResponse.count({
            where: { rfp: { buyer_id: userId } },
        }),
        
        // Pending responses (Under Review)
        prisma.supplierResponse.count({
            where: {
                rfp: { buyer_id: userId },
                status: { code: 'Submitted' },
            },
        }),
        
        // Approved responses
        prisma.supplierResponse.count({
            where: {
                rfp: { buyer_id: userId },
                status: { code: 'Approved' },
            },
        }),
        
        // Rejected responses
        prisma.supplierResponse.count({
            where: {
                rfp: { buyer_id: userId },
                status: { code: 'Rejected' },
            },
        }),
    ]);

    return {
        totalRfps,
        publishedRfps,
        draftRfps,
        totalResponses,
        pendingResponses,
        approvedResponses,
        rejectedResponses,
        role: 'Buyer',
    };
};

const getSupplierStats = async (userId: string) => {
    const [
        totalResponses,
        draftResponses,
        submittedResponses,
        approvedResponses,
        rejectedResponses,
        availableRfps,
    ] = await Promise.all([
        // Total responses submitted
        prisma.supplierResponse.count({ where: { supplier_id: userId } }),
        
        // Draft responses
        prisma.supplierResponse.count({
            where: { supplier_id: userId, status: { code: 'Draft' } },
        }),
        
        // Submitted responses
        prisma.supplierResponse.count({
            where: { supplier_id: userId, status: { code: 'Submitted' } },
        }),
        
        // Approved responses
        prisma.supplierResponse.count({
            where: { supplier_id: userId, status: { code: 'Approved' } },
        }),
        
        // Rejected responses
        prisma.supplierResponse.count({
            where: { supplier_id: userId, status: { code: 'Rejected' } },
        }),
        
        // Available RFPs to respond to
        prisma.rFP.count({
            where: {
                status: { code: 'Published' },
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
        approvedResponses,
        rejectedResponses,
        availableRfps,
        role: 'Supplier',
    };
};
