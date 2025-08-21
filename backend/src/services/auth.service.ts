import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const register = async (email: string, password: string, roleName: 'Buyer' | 'Supplier') => {
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
            email,
            password_hash,
            role_id: role.id,
        },
    });

    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

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

    const token = jwt.sign(
        {
            userId: user.id,
            role: user.role.name,
            permissions: user.role.permissions
        },
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' }
    );

    return {
        token,
        user: {
            email: user.email,
            id: user.id
        }
    };
};
