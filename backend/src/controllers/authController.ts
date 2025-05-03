import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { UserModel, UserAuditLogModel } from '../models';
import { AuditAction } from '../../models/userAuditLog';
import { UserRole } from '../../models/user';
import '../types'; // Import the Express type extensions
import { Sequelize, Op } from 'sequelize';

// Simple in-memory OTP storage (replace with a proper DB table in production)
const otpStore: Record<string, { otp: string, expiresAt: Date }> = {};

// Generate a random 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const requestOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Check if email exists in our user database
  const user = await UserModel.findOne({ where: { email, isActive: true }});
  
  if (!user) {
    // For security reasons, don't reveal that the user doesn't exist
    return res.status(200).json({ 
      message: 'If your email is registered, you will receive an OTP shortly'
    });
  }

  // Generate a new OTP
  const otp = generateOTP();
  
  // Store OTP with 10-minute expiration
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);
  
  otpStore[email] = { otp, expiresAt };
  
  // In a real application, you would send this via email
  console.log('===============================================');
  console.log(`OTP for ${email}: ${otp}`);
  console.log('===============================================');
  
  // For development, return the OTP in the response
  // In production, you should only acknowledge the request
  const isDev = process.env.NODE_ENV === 'development';
  console.log('Current environment:', process.env.NODE_ENV);
  console.log('Is development mode:', isDev);
  
  res.status(200).json({ 
    message: 'OTP sent successfully',
    // Include OTP in development mode
    ...(isDev ? { otp } : {})
  });
});

export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  const storedData = otpStore[email];
  
  // Check if OTP exists and hasn't expired
  if (!storedData || new Date() > storedData.expiresAt) {
    return res.status(401).json({ error: 'OTP is invalid or expired' });
  }

  // Verify OTP
  if (storedData.otp !== otp) {
    return res.status(401).json({ error: 'Invalid OTP' });
  }

  // Find user in database
  const user = await UserModel.findOne({ where: { email, isActive: true }});
  
  if (!user) {
    return res.status(401).json({ error: 'User not found or inactive' });
  }

  // Clear OTP after successful verification
  delete otpStore[email];
  
  // Update last login time
  await user.update({ lastLogin: new Date() });
  
  // Create login audit log
  await UserAuditLogModel.create({
    userId: user.id as number, // Add type assertion here
    action: AuditAction.LOGIN,
    ipAddress: ipAddress
  });

  // Return user details
  res.status(200).json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  });
});

export const listAdmins = asyncHandler(async (req: Request, res: Response) => {
  // Get the requester's user ID from the session or token
  const requesterId = req.user?.id;
  
  if (!requesterId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Check if requester is a super admin
  const requester = await UserModel.findByPk(requesterId);
  
  if (!requester || requester.role !== UserRole.SUPER_ADMIN) {
    return res.status(403).json({ error: 'Only super admins can view admin users' });
  }
  
  // Get all admin users
  const admins = await UserModel.findAll({
    where: {
      role: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
      isActive: true
    },
    attributes: ['id', 'email', 'name', 'role', 'lastLogin', 'createdAt']
  });
  
  return res.status(200).json(admins);
});

export const createAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { email, name } = req.body;
  const requesterId = req.user?.id;
  const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
  
  if (!requesterId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Check if requester is a super admin
  const requester = await UserModel.findByPk(requesterId);
  
  if (!requester || requester.role !== UserRole.SUPER_ADMIN) {
    return res.status(403).json({ error: 'Only super admins can create admin users' });
  }
  
  // Check if email is already in use
  const existing = await UserModel.findOne({ where: { email } });
  
  if (existing) {
    return res.status(400).json({ error: 'Email already in use' });
  }
  
  // Create new admin
  const newAdmin = await UserModel.create({
    email,
    name,
    role: UserRole.ADMIN,
    isActive: true
  });
  
  // Log the action
  await UserAuditLogModel.create({
    userId: requesterId,
    action: AuditAction.CREATE,
    entityType: 'User',
    entityId: newAdmin.id as number, // Add type assertion
    changes: { email, name, role: UserRole.ADMIN },
    ipAddress
  });
  
  // Return new admin details
  return res.status(201).json({
    id: newAdmin.id,
    email: newAdmin.email,
    name: newAdmin.name,
    role: newAdmin.role,
    createdAt: newAdmin.createdAt
  });
});

export const getUserActivity = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  // Use non-null assertion since we check for it right after
  const requesterId = req.user?.id;
  
  if (!requesterId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Check if requester is a super admin
  const requester = await UserModel.findByPk(requesterId);
  
  if (!requester || requester.role !== UserRole.SUPER_ADMIN) {
    return res.status(403).json({ error: 'Only super admins can view user activity' });
  }
  
  // Get audit logs for the specified user - safely parse userId
  const userIdNum = parseInt(userId);
  if (isNaN(userIdNum)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  const auditLogs = await UserAuditLogModel.findAll({
    where: { userId: userIdNum },
    order: [['createdAt', 'DESC']],
    limit: 100
  });
  
  return res.status(200).json(auditLogs);
});

export const deactivateUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const requesterId = req.user?.id;
  const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
  
  // Safely parse userId
  const userIdNum = parseInt(userId);
  if (isNaN(userIdNum)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  if (!requesterId || userIdNum === requesterId) {
    return res.status(400).json({ error: 'Cannot deactivate yourself' });
  }
  
  // Check if requester is a super admin
  const requester = await UserModel.findByPk(requesterId);
  
  if (!requester || requester.role !== UserRole.SUPER_ADMIN) {
    return res.status(403).json({ error: 'Only super admins can deactivate users' });
  }
  
  // Get user to deactivate
  const userToDeactivate = await UserModel.findByPk(userIdNum);
  
  if (!userToDeactivate) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // If trying to deactivate the only super admin, prevent it
  if (userToDeactivate.role === UserRole.SUPER_ADMIN) {
    const superAdminCount = await UserModel.count({
      where: { role: UserRole.SUPER_ADMIN, isActive: true }
    });
    
    if (superAdminCount <= 1) {
      return res.status(400).json({ error: 'Cannot deactivate the only super admin' });
    }
  }
  
  // Deactivate user
  await userToDeactivate.update({ isActive: false });
  
  // Log the action
  await UserAuditLogModel.create({
    userId: requesterId,
    action: AuditAction.UPDATE,
    entityType: 'User',
    entityId: userIdNum,
    changes: { isActive: false },
    ipAddress
  });
  
  return res.status(200).json({ message: 'User deactivated successfully' });
});

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  // Get the requester's user ID from the session or token
  const requesterId = req.user?.id;
  
  console.log('listUsers called - authenticated user:', req.user);
  
  if (!requesterId) {
    console.log('listUsers - No requesterId found');
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Check if requester is an admin
  const requester = await UserModel.findByPk(requesterId);
  console.log('listUsers - requester found:', requester?.email, requester?.role);
  
  if (!requester || (requester.role !== UserRole.ADMIN && requester.role !== UserRole.SUPER_ADMIN)) {
    console.log('listUsers - Permission denied for user:', requester?.email, requester?.role);
    return res.status(403).json({ error: 'Admin permission required' });
  }
  
  // Get all users
  const users = await UserModel.findAll({
    where: {
      isActive: true
    },
    attributes: ['id', 'email', 'name', 'role', 'lastLogin', 'createdAt']
  });
  
  console.log(`listUsers - Returning ${users.length} users`);
  return res.status(200).json(users);
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, name, role } = req.body;
  const requesterId = req.user?.id;
  const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
  
  if (!requesterId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Check if requester has admin permissions
  const requester = await UserModel.findByPk(requesterId);
  
  if (!requester || (requester.role !== UserRole.ADMIN && requester.role !== UserRole.SUPER_ADMIN)) {
    return res.status(403).json({ error: 'Admin permission required' });
  }
  
  // Only super admins can create admin users
  if (role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) {
    if (requester.role !== UserRole.SUPER_ADMIN) {
      return res.status(403).json({ error: 'Only super admins can create admin users' });
    }
  }
  
  // Check if email is already in use
  const existing = await UserModel.findOne({ where: { email } });
  
  if (existing) {
    return res.status(400).json({ error: 'Email already in use' });
  }
  
  // Create new user
  const newUser = await UserModel.create({
    email,
    name,
    role: role || UserRole.STAFF,
    isActive: true
  });
  
  // Log the action
  await UserAuditLogModel.create({
    userId: requesterId,
    action: AuditAction.CREATE,
    entityType: 'User',
    entityId: newUser.id as number,
    changes: { email, name, role: role || UserRole.STAFF },
    ipAddress
  });
  
  // Return new user details
  return res.status(201).json({
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
    createdAt: newUser.createdAt
  });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { name, role } = req.body;
  const requesterId = req.user?.id;
  const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
  
  // Safely parse userId
  const userIdNum = parseInt(userId);
  if (isNaN(userIdNum)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  if (!requesterId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Check if requester has admin permissions
  const requester = await UserModel.findByPk(requesterId);
  
  if (!requester || (requester.role !== UserRole.ADMIN && requester.role !== UserRole.SUPER_ADMIN)) {
    return res.status(403).json({ error: 'Admin permission required' });
  }
  
  // Get user to update
  const userToUpdate = await UserModel.findByPk(userIdNum);
  
  if (!userToUpdate) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Only super admins can modify admin users
  if (userToUpdate.role === UserRole.ADMIN || userToUpdate.role === UserRole.SUPER_ADMIN || 
      role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) {
    if (requester.role !== UserRole.SUPER_ADMIN) {
      return res.status(403).json({ error: 'Only super admins can modify admin users' });
    }
  }
  
  // Track changes for audit log
  const changes: Record<string, any> = {};
  
  if (name !== undefined && name !== userToUpdate.name) {
    changes.name = name;
  }
  
  if (role !== undefined && role !== userToUpdate.role) {
    // If trying to demote the only super admin, prevent it
    if (userToUpdate.role === UserRole.SUPER_ADMIN && role !== UserRole.SUPER_ADMIN) {
      const superAdminCount = await UserModel.count({
        where: { role: UserRole.SUPER_ADMIN, isActive: true }
      });
      
      if (superAdminCount <= 1) {
        return res.status(400).json({ error: 'Cannot demote the only super admin' });
      }
    }
    changes.role = role;
  }
  
  // If no changes, return success without updating
  if (Object.keys(changes).length === 0) {
    return res.status(200).json({
      id: userToUpdate.id,
      email: userToUpdate.email,
      name: userToUpdate.name,
      role: userToUpdate.role,
      lastLogin: userToUpdate.lastLogin,
      createdAt: userToUpdate.createdAt
    });
  }
  
  // Update user
  await userToUpdate.update(changes);
  
  // Log the action
  await UserAuditLogModel.create({
    userId: requesterId,
    action: AuditAction.UPDATE,
    entityType: 'User',
    entityId: userIdNum,
    changes,
    ipAddress
  });
  
  return res.status(200).json({
    id: userToUpdate.id,
    email: userToUpdate.email,
    name: userToUpdate.name,
    role: userToUpdate.role,
    lastLogin: userToUpdate.lastLogin,
    createdAt: userToUpdate.createdAt
  });
});

export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const { query } = req.query;
  const requesterId = req.user?.id;
  
  if (!requesterId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Check if requester has admin permissions
  const requester = await UserModel.findByPk(requesterId);
  
  if (!requester || (requester.role !== UserRole.ADMIN && requester.role !== UserRole.SUPER_ADMIN)) {
    return res.status(403).json({ error: 'Admin permission required' });
  }
  
  // Search conditions
  const searchCondition = query
    ? {
        [Op.or]: [
          { email: { [Op.iLike]: `%${query}%` } },
          { name: { [Op.iLike]: `%${query}%` } }
        ],
        isActive: true
      }
    : { isActive: true };
  
  // Get matching users
  const users = await UserModel.findAll({
    where: searchCondition,
    attributes: ['id', 'email', 'name', 'role', 'lastLogin', 'createdAt']
  });
  
  return res.status(200).json(users);
}); 