import { UserRole } from '../../models/user';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: UserRole;
      };
    }
  }
} 