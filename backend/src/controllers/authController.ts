import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { UserModel, UserAuditLogModel } from '../models';
import { AuditAction } from '../../models/userAuditLog';
import { UserRole } from '../../models/user';
import '../types'; // Import the Express type extensions

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
  console.log(`OTP for ${email}: ${otp}`);
  
  // For development, return the OTP in the response
  // In production, you should only acknowledge the request
  res.status(200).json({ 
    message: 'OTP sent successfully',
    // Remove this in production!
    otp: otp
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