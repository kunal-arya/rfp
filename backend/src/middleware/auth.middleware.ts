import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// This is a simplified representation of our permissions object for type-checking
interface UserPermissions {
    [resource: string]: {
        [action: string]: {
            allowed: boolean;
            scope?: string;
            [key: string]: any;
        };
    };
}

// Extend the Express Request type to include our user payload
export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        role: string;
        permissions: UserPermissions;
    };
}

export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization;

    if (!bearer || !bearer.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const [, token] = bearer.split(' ');

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token format' });
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = user as any; // We'll refine this with a checkPermission function
        next();
    } catch (e) {
        console.error(e);
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

export const hasPermission = (resource: string, action: string) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userPermissions = req.user.permissions;
        const permission = userPermissions[resource]?.[action];

        if (permission?.allowed) {
            // More complex checks for scope (e.g., 'own') would go here
            // For now, we just check if the action is allowed.
            next();
        } else {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to perform this action' });
        }
    };
};
