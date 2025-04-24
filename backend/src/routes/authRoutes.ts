import { Router } from 'express';
import { requestOTP, verifyOTP } from '../controllers/authController';

const router = Router();

router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTP);
router.post('/logout', (req, res) => {
  // In a real app, this would invalidate the token or session
  res.status(200).json({ message: 'Logged out successfully' });
});

export default router; 