import { Router } from 'express';
import { requestOTP, verifyOTP, listAdmins, createAdmin, getUserActivity, deactivateUser } from '../controllers/authController';
import { isAuthenticated, isSuperAdmin } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTP);

// Protected routes - Super Admin only
router.get('/admins', isAuthenticated, isSuperAdmin, listAdmins);
router.post('/admins', isAuthenticated, isSuperAdmin, createAdmin);
router.get('/users/:userId/activity', isAuthenticated, isSuperAdmin, getUserActivity);
router.put('/users/:userId/deactivate', isAuthenticated, isSuperAdmin, deactivateUser);

export default router; 