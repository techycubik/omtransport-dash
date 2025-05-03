import { Router } from 'express';
import { 
  requestOTP, 
  verifyOTP, 
  listAdmins, 
  createAdmin, 
  getUserActivity, 
  deactivateUser, 
  listUsers,
  createUser,
  updateUser,
  searchUsers
} from '../controllers/authController';
import { isAuthenticated, isSuperAdmin, isAdmin } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTP);

// Protected routes - Super Admin only
router.get('/admins', isAuthenticated, isSuperAdmin, listAdmins);
router.post('/admins', isAuthenticated, isSuperAdmin, createAdmin);

// Protected routes - Admin or Super Admin
router.get('/users', isAuthenticated, isAdmin, listUsers);
router.get('/users/search', isAuthenticated, isAdmin, searchUsers);
router.post('/users', isAuthenticated, isAdmin, createUser);
router.put('/users/:userId', isAuthenticated, isAdmin, updateUser);

router.get('/users/:userId/activity', isAuthenticated, isSuperAdmin, getUserActivity);
router.put('/users/:userId/deactivate', isAuthenticated, isSuperAdmin, deactivateUser);

export default router; 