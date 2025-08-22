import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

let io: SocketIOServer;

export const initializeWebSocket = (server: HTTPServer) => {
    io = new SocketIOServer(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    // Authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        
        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
            socket.data.user = decoded;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User ${socket.data.user.userId} connected`);

        // Join user to their role-specific room
        const userRole = socket.data.user.role;
        socket.join(userRole);

        // Join user to their personal room for user-specific notifications
        socket.join(`user_${socket.data.user.userId}`);

        socket.on('disconnect', () => {
            console.log(`User ${socket.data.user.userId} disconnected`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

// Notification functions
export const notifyRfpPublished = (rfpData: any) => {
    const io = getIO();
    io.to('Supplier').emit('rfp_published', {
        type: 'RFP_PUBLISHED',
        data: rfpData,
        timestamp: new Date().toISOString()
    });
};

export const notifyResponseSubmitted = (responseData: any, buyerId: string) => {
    const io = getIO();
    io.to(`user_${buyerId}`).emit('response_submitted', {
        type: 'RESPONSE_SUBMITTED',
        data: responseData,
        timestamp: new Date().toISOString()
    });
};

export const notifyRfpStatusChanged = (rfpData: any, supplierIds: string[]) => {
    const io = getIO();
    supplierIds.forEach(supplierId => {
        io.to(`user_${supplierId}`).emit('rfp_status_changed', {
            type: 'RFP_STATUS_CHANGED',
            data: rfpData,
            timestamp: new Date().toISOString()
        });
    });
};

export const notifyUser = (userId: string, event: string, data: any) => {
    const io = getIO();
    io.to(`user_${userId}`).emit(event, {
        ...data,
        timestamp: new Date().toISOString()
    });
};
