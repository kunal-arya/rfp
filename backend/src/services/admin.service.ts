import { PrismaClient } from '@prisma/client';
import * as auditService from './audit.service';
import { USER_STATUS } from '../utils/enum';

const prisma = new PrismaClient();

export const getUsers = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  user?: any;
}) => {
  const { page = 1, limit = 10, search, role, status, user } = params;
  const offset = (page - 1) * limit;

  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (role && role !== 'all') {
    whereClause.role = { name: role };
  }

  if (status && status !== 'all') {
    whereClause.status = status;
  }

  const users = await prisma.user.findMany({
    where: {
      ...whereClause,
      id: {
        not: user.userId
      }
    },
    include: {
      role: true,
    },
    skip: offset,
    take: parseInt(limit.toString()),
    orderBy: { created_at: 'desc' },
  });

  const total = await prisma.user.count({ where: whereClause });

  return {
    data: users,
    total,
    page: parseInt(page.toString()),
    limit: parseInt(limit.toString()),
  };
};

export const getUser = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      role: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

export const updateUser = async (id: string, data: { name?: string; email?: string; role?: string }) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      role: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const role = await prisma.role.findUnique({
    where: { name: data.role },
  });
  
  if (!role) {
    throw new Error('Role not found');
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      role_id: role.id,
    },
    include: {
      role: true,
    },
  });

  return updatedUser;
};

export const deleteUser = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { role: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  await prisma.user.delete({
    where: { id }
  });

  return { message: 'User deleted successfully' };
};

export const toggleUserStatus = async (id: string, action: 'activate' | 'deactivate') => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { role: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const newStatus = action === 'activate' ? 'active' : 'inactive';
  
  const updatedUser = await prisma.user.update({
    where: { id },
    data: { status: newStatus },
    include: { role: true }
  });

  return { 
    message: `User ${action}d successfully`,
    user: updatedUser
  };
};

export const getUserStats = async () => {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    lastMonthUsers,
    twoMonthsAgoUsers,
    activeUsersLastWeek,
    activeUsersTwoWeeksAgo,
    totalBuyers,
    inactiveBuyers,
    totalSuppliers,
    inactiveSuppliers,
  ] = await Promise.all([
    // Total Users
    prisma.user.count(),
    
    // Users created last month
    prisma.user.count({
      where: {
        created_at: { gte: lastMonth },
      },
    }),
    
    // Users created two months ago
    prisma.user.count({
      where: {
        created_at: { gte: twoMonthsAgo, lt: lastMonth },
      },
    }),
    
    // Active users in last week (users who logged in)
    prisma.auditTrail.groupBy({
      by: ['user_id'],
      where: {
        action: 'USER_LOGIN',
        created_at: { gte: lastWeek },
      },
    }).then(result => result.length),
    
    // Active users in previous week
    prisma.auditTrail.groupBy({
      by: ['user_id'],
      where: {
        action: 'USER_LOGIN',
        created_at: { gte: twoWeeksAgo, lt: lastWeek },
      },
    }).then(result => result.length),
    
    // Total Buyers
    prisma.user.count({
      where: {
        role: { name: 'Buyer' },
      },
    }),

    // InActive Buyers
    prisma.user.count({
      where: {
        role: { name: 'Buyer' },
        status: USER_STATUS.Inactive,
      },
    }),
    
    // Total Suppliers
    prisma.user.count({
      where: {
        role: { name: 'Supplier' },
      },
    }),

    // InActive Suppliers
    prisma.user.count({
      where: {
        role: { name: 'Supplier' },
        status: USER_STATUS.Inactive,
      },
    }),
  ]);

  // Calculate percentage changes
  const userGrowthLastMonth = twoMonthsAgoUsers === 0 
    ? (lastMonthUsers > 0 ? 100 : 0)
    : Math.round(((lastMonthUsers - twoMonthsAgoUsers) / twoMonthsAgoUsers) * 100);

  const activeUserGrowthLastWeek = activeUsersTwoWeeksAgo === 0
    ? (activeUsersLastWeek > 0 ? 100 : 0)
    : Math.round(((activeUsersLastWeek - activeUsersTwoWeeksAgo) / activeUsersTwoWeeksAgo) * 100);

  return {
    totalUsers,
    userGrowthLastMonth: userGrowthLastMonth > 0 ? `+${userGrowthLastMonth}%` : `${userGrowthLastMonth}%`,
    activeUsers: activeUsersLastWeek,
    activeUserGrowthLastWeek: activeUserGrowthLastWeek > 0 ? `+${activeUserGrowthLastWeek}%` : `${activeUserGrowthLastWeek}%`,
    totalBuyers,
    inactiveBuyers,
    totalSuppliers,
    inactiveSuppliers,
  };
};

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
  roleName: string;
}) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Get role ID based on role name
  const role = await prisma.role.findUnique({
    where: { name: data.roleName }
  });

  if (!role) {
    throw new Error('Invalid role');
  }

  // Hash password
  const bcrypt = require('bcrypt');
  const passwordHash = await bcrypt.hash(data.password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password_hash: passwordHash,
      role_id: role.id,
      status: 'active'
    },
    include: {
      role: true
    }
  });

  return user;
};
