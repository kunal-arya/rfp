import sgMail from '@sendgrid/mail';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailData {
    to: string;
    subject: string;
    html: string;
    from?: string;
}

export const sendEmail = async (emailData: EmailData) => {
    try {
        const msg = {
            to: emailData.to,
            from: emailData.from || process.env.FROM_EMAIL || 'noreply@rfp-system.com',
            subject: emailData.subject,
            html: emailData.html,
        };

        if (!process.env.SENDGRID_API_KEY) {
            console.log('Email would be sent (development mode):', msg);
            return { success: true, message: 'Email logged (development mode)' };
        }

        await sgMail.send(msg);
        return { success: true, message: 'Email sent successfully' };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, message: 'Email sending failed' };
    }
};

export const sendRfpPublishedNotification = async (rfpId: string) => {
    try {
        const rfp = await prisma.rFP.findUnique({
            where: { id: rfpId },
            include: {
                current_version: true,
                buyer: true,
            },
        });

        if (!rfp) {
            throw new Error('RFP not found');
        }

        // Get all suppliers
        const suppliers = await prisma.user.findMany({
            where: {
                role: { name: 'Supplier' },
            },
        });

        const emailPromises = suppliers.map(supplier => {
            const emailData: EmailData = {
                to: supplier.email,
                subject: `New RFP Available: ${rfp.title}`,
                html: `
                    <h2>New RFP Available</h2>
                    <p>A new Request for Proposal has been published:</p>
                    <h3>${rfp.title}</h3>
                    <p><strong>Description:</strong> ${rfp.current_version?.description || 'N/A'}</p>
                    <p><strong>Requirements:</strong> ${rfp.current_version?.requirements || 'N/A'}</p>
                    <p><strong>Deadline:</strong> ${rfp.current_version?.deadline ? new Date(rfp.current_version.deadline).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Budget Range:</strong> $${rfp.current_version?.budget_min || 'N/A'} - $${rfp.current_version?.budget_max || 'N/A'}</p>
                    <p>Please log in to your dashboard to view the full details and submit your response.</p>
                `,
            };
            return sendEmail(emailData);
        });

        await Promise.all(emailPromises);
        return { success: true, message: `Notifications sent to ${suppliers.length} suppliers` };
    } catch (error) {
        console.error('RFP published notification failed:', error);
        return { success: false, message: 'Notification failed' };
    }
};

export const sendResponseSubmittedNotification = async (responseId: string) => {
    try {
        const response = await prisma.supplierResponse.findUnique({
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

        if (!response) {
            throw new Error('Response not found');
        }

        const emailData: EmailData = {
            to: response.rfp.buyer.email,
            subject: `New Response Received: ${response.rfp.title}`,
            html: `
                <h2>New Response Received</h2>
                <p>A supplier has submitted a response to your RFP:</p>
                <h3>${response.rfp.title}</h3>
                <p><strong>Supplier:</strong> ${response.supplier.email}</p>
                <p><strong>Proposed Budget:</strong> $${response.proposed_budget || 'N/A'}</p>
                <p><strong>Timeline:</strong> ${response.timeline || 'N/A'}</p>
                <p>Please log in to your dashboard to review the response.</p>
            `,
        };

        return await sendEmail(emailData);
    } catch (error) {
        console.error('Response submitted notification failed:', error);
        return { success: false, message: 'Notification failed' };
    }
};

export const sendRfpStatusChangeNotification = async (rfpId: string, newStatus: string) => {
    try {
        const rfp = await prisma.rFP.findUnique({
            where: { id: rfpId },
            include: {
                current_version: true,
                buyer: true,
                supplier_responses: {
                    include: {
                        supplier: true,
                    },
                },
            },
        });

        if (!rfp) {
            throw new Error('RFP not found');
        }

        // Notify all suppliers who responded to this RFP
        const emailPromises = rfp.supplier_responses.map(response => {
            const emailData: EmailData = {
                to: response.supplier.email,
                subject: `RFP Status Update: ${rfp.title}`,
                html: `
                    <h2>RFP Status Update</h2>
                    <p>The status of the RFP you responded to has been updated:</p>
                    <h3>${rfp.title}</h3>
                    <p><strong>New Status:</strong> ${newStatus}</p>
                    <p>Please log in to your dashboard to view the updated status.</p>
                `,
            };
            return sendEmail(emailData);
        });

        await Promise.all(emailPromises);
        return { success: true, message: `Status update notifications sent to ${rfp.supplier_responses.length} suppliers` };
    } catch (error) {
        console.error('RFP status change notification failed:', error);
        return { success: false, message: 'Notification failed' };
    }
};
