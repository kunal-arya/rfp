import { PrismaClient } from '@prisma/client';
import { CreateRfpData, SubmitResponseData } from '../validations/rfp.validation';

const prisma = new PrismaClient();

export const createRfp = async (rFPData: CreateRfpData, buyerId: string) => {
    const { title, description, requirements, budget_min, budget_max, deadline, notes } = rFPData;

    const draftStatus = await prisma.rFPStatus.findUnique({
        where: { code: 'Draft' },
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

    if (rFP.buyer_id !== userId) {
        throw new Error('You are not authorized to publish this RFP');
    }

    const publishedStatus = await prisma.rFPStatus.findUnique({
        where: { code: 'Published' },
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

export const getPublishedRfps = async () => {
    const publishedStatus = await prisma.rFPStatus.findUnique({
        where: { code: 'Published' },
    });

    if (!publishedStatus) {
        // This should not happen if the database is seeded correctly
        throw new Error('Published status not found');
    }

    const rFPs = await prisma.rFP.findMany({
        where: {
            status_id: publishedStatus.id,
        },
        include: {
            versions: true,
            buyer: true,
        },
    });

    return rFPs;
};

export const submitResponse = async (rFPId: string, responseData: SubmitResponseData, supplierId: string) => {
    const { proposed_budget, timeline, cover_letter } = responseData;

    const rFP = await prisma.rFP.findUnique({
        where: { id: rFPId },
    });

    if (!rFP) {
        throw new Error('RFP not found');
    }

    const submittedStatus = await prisma.supplierResponseStatus.findUnique({
        where: { code: 'Submitted' },
    });

    if (!submittedStatus) {
        // This should not happen if the database is seeded correctly
        throw new Error('Submitted status not found');
    }

    const response = await prisma.supplierResponse.create({
        data: {
            rfp_id: rFPId,
            supplier_id: supplierId,
            status_id: submittedStatus.id,
            proposed_budget,
            timeline,
            cover_letter,
        },
    });

    return response;
};