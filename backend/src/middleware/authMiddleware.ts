import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models';
import { UserRole } from '../../models/user';
import '../types'; // Import the Express type extensions

// Verify if user is authenticated
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get user ID from session or token (implementation depends on your auth system)
    // This is just a placeholder - replace with your actual auth mechanism
    const userIdStr = req.headers['user-id'] as string | undefined;
    console.log('Auth middleware - user-id header:', userIdStr);
    
    const userId = userIdStr ? parseInt(userIdStr) : undefined;
    
    if (!userId || isNaN(userId)) {
      console.log('Authentication failed: Missing or invalid user ID');
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Find user in database
    const user = await UserModel.findOne({ 
      where: { id: userId, isActive: true },
      attributes: ['id', 'email', 'role']
    });
    
    if (!user) {
      console.log(`Authentication failed: User ${userId} not found or inactive`);
      return res.status(401).json({ error: 'User not found or inactive' });
    }
    
    // Add user to request object - with non-null assertion for id since we found the user
    req.user = {
      id: user.id!,
      email: user.email,
      role: user.role as UserRole
    };
    
    console.log(`User authenticated: ${user.email} (${user.role})`);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    next(error);
  }
};

// Verify if user is an admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPER_ADMIN)) {
    return res.status(403).json({ error: 'Admin permission required' });
  }
  
  next();
};

// Verify if user is a super admin
export const isSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== UserRole.SUPER_ADMIN) {
    return res.status(403).json({ error: 'Super admin permission required' });
  }
  
  next();
}; 