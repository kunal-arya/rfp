import { PrismaClient } from '@prisma/client';
import { RoleName, USER_STATUS } from '../utils/enum';

const prisma = new PrismaClient();

export interface NotificationData {
    template_code: string;
    user_id: string;
    data?: any;
}

export const notificationService = {
    getUserNotifications: async (user: any, page: number = 1, limit: number = 10, unreadOnly: boolean = false) => {
        const offset = (page - 1) * limit;

        const whereClause = {
            ...(user.role === RoleName.Admin ? {} : { user_id: user.userId }),
            ...(unreadOnly && { is_read: false })
        };

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where: whereClause,
                include: {
                    template: true,
                },
                orderBy: {
                    created_at: 'desc'
                },
                skip: offset,
                take: limit
            }),
            prisma.notification.count({
                where: whereClause
            })
        ]);

        return {
            notifications,
            total,
            page,
            limit
        };
    },

    getUnreadCount: async (userId: string) => {
        return await prisma.notification.count({
            where: {
                user_id: userId,
                is_read: false
            }
        });
    },

    markAsRead: async (notificationId: string, userId: string) => {
        const notification = await prisma.notification.findFirst({
            where: {
                id: notificationId,
                user_id: userId
            }
        });

        if (!notification) {
            throw new Error('Notification not found');
        }

        await prisma.notification.update({
            where: {
                id: notificationId
            },
            data: {
                is_read: true
            }
        });
    },

    markAllAsRead: async (userId: string) => {
        await prisma.notification.updateMany({
            where: {
                user_id: userId,
                is_read: false
            },
            data: {
                is_read: true
            }
        });
    },

    createNotification: async (notificationData: NotificationData) => {
        return await prisma.notification.create({
            data: {
                user_id: notificationData.user_id,
                template_code: notificationData.template_code,
                data: notificationData.data || {},
                sent_at: new Date()
            },
            include: {
                template: true,
                user: true
            }
        });
    },

    createNotificationForRole: async (roleName: string, templateCode: string, data?: any) => {
        // Get all users with the specified role
        const users = await prisma.user.findMany({
            where: {
                role: {
                    name: roleName
                },
                status: { equals: USER_STATUS.Active }
            }
        });

        // Create notifications for all users in the role
        const notifications = await Promise.all(
            users.map(user => 
                prisma.notification.create({
                    data: {
                        user_id: user.id,
                        template_code: templateCode,
                        data: data || {},
                        sent_at: new Date()
                    }
                })
            )
        );

        return notifications;
    },

    createNotificationForUser: async (userId: string, templateCode: string, data?: any) => {
        return await prisma.notification.create({
            data: {
                user_id: userId,
                template_code: templateCode,
                data: data || {},
                sent_at: new Date()
            },
            include: {
                template: true,
                user: true
            }
        });
    },

    // Helper method to create notification templates
    createNotificationTemplate: async (code: string, title: string, message: string, channel: string = 'BOTH') => {
        return await prisma.notificationTemplate.upsert({
            where: { code },
            update: {
                title,
                message,
                channel
            },
            create: {
                code,
                title,
                message,
                channel
            }
        });
    },

    // Initialize default notification templates
    initializeDefaultTemplates: async () => {
        const templates = [
            {
                code: 'RFP_PUBLISHED',
                title: 'New RFP Published',
                message: 'A new RFP "{{rfp_title}}" has been published by {{buyer_name}}. Deadline: {{deadline}}',
                channel: 'BOTH'
            },
            {
                code: 'RESPONSE_SUBMITTED',
                title: 'New Response Received',
                message: 'A new response has been submitted for RFP "{{rfp_title}}" by {{supplier_name}}',
                channel: 'BOTH'
            },
            {
                code: 'RFP_STATUS_CHANGED',
                title: 'RFP Status Updated',
                message: 'The status of RFP "{{rfp_title}}" has been changed to {{new_status}}',
                channel: 'BOTH'
            },
            {
                code: 'DEADLINE_APPROACHING',
                title: 'RFP Deadline Approaching',
                message: 'The deadline for RFP "{{rfp_title}}" is approaching on {{deadline}}',
                channel: 'BOTH'
            },
            {
                code: 'RESPONSE_MOVED_TO_REVIEW',
                title: 'Response Under Review',
                message: 'Your response to RFP "{{rfp_title}}" has been moved to review status. The buyer is now evaluating your proposal.',
                channel: 'BOTH'
            },
            {
                code: 'RESPONSE_APPROVED',
                title: 'Response Approved',
                message: 'Congratulations! Your response to RFP "{{rfp_title}}" has been approved by the buyer.',
                channel: 'BOTH'
            },
            {
                code: 'RESPONSE_REJECTED',
                title: 'Response Rejected',
                message: 'Your response to RFP "{{rfp_title}}" has been rejected. Reason: {{rejection_reason}}',
                channel: 'BOTH'
            },
            {
                code: 'RESPONSE_AWARDED',
                title: 'Response Awarded',
                message: '🎉 Congratulations! Your response to RFP "{{rfp_title}}" has been awarded! You are the winning supplier.',
                channel: 'BOTH'
            },
            {
                code: 'RFP_AWARDED',
                title: 'RFP Awarded',
                message: 'The RFP "{{rfp_title}}" has been awarded to a supplier. Thank you for your participation.',
                channel: 'BOTH'
            }
        ];

        for (const template of templates) {
            await notificationService.createNotificationTemplate(
                template.code,
                template.title,
                template.message,
                template.channel
            );
        }
    }
};
