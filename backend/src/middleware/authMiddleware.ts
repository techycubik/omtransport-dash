import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models';
import { UserRole } from '../../models/user';

// Verify if user is authenticated
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get user ID from session or token (implementation depends on your auth system)
    // This is just a placeholder - replace with your actual auth mechanism
    const userId = req.headers['user-id'] ? parseInt(req.headers['user-id'] as string) : undefined;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Find user in database
    const user = await UserModel.findOne({ 
      where: { id: userId, isActive: true },
      attributes: ['id', 'email', 'role']
    });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }
    
    // Add user to request object
    req.user = {
      id: user.id!,
      email: user.email,
      role: user.role as UserRole
    };
    
    next();
  } catch (error) {
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