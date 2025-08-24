import { PrismaClient, Role, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createAuditEntry, AUDIT_ACTIONS } from './audit.service';

const prisma = new PrismaClient();

export const register = async (name: string, email: string, password: string, roleName: 'Buyer' | 'Supplier') => {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error('Email already exists');
    }

    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
        // This should not happen if the database is seeded correctly
        throw new Error('Role not found');
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password_hash,
            role_id: role.id,
        },
    });

    const { password_hash: _, ...userWithoutPassword } = user;
    const token = jwtToken(user, role);
    // Create audit trail entry for registration
    await createAuditEntry(user.id, AUDIT_ACTIONS.USER_REGISTERED, 'User', user.id, {
        name: user.name,
        email: user.email,
        role: role.name,
    });

    const response = {
        user: {
            ...userWithoutPassword,
            role: role.name,
        },
        permissions: role.permissions,
        token: token
    }
    return response;
};

const jwtToken = (user: User, role: Role) => {

    const token = jwt.sign(
        {
            userId: user.id,
            role: role.name,
            permissions: role.permissions
        },
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' }
    );

    return token
}

export const login = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            role: true, // Include the full role object
        },
    });

    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
        throw new Error('Invalid credentials');
    }

    const token = jwtToken(user, user.role);

    // Create audit trail entry for login
    await createAuditEntry(user.id, AUDIT_ACTIONS.USER_LOGIN, 'User', user.id, {
        email: user.email,
        role: user.role.name,
    });

    return {
        token,
        permissions: user.role.permissions,
        user: {
            name: user.name,
            email: user.email,
            id: user.id,
            role_id: user.role_id,
            role: user.role.name,
        }
    };
};
