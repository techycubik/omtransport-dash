import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';

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

  // Clear OTP after successful verification
  delete otpStore[email];

  // In a real app, you would create a session or JWT token here
  // For now, just return a mock user object
  res.status(200).json({
    id: 1,
    email,
    role: 'ADMIN'
  });
}); 