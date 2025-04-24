'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { requestOTP, login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const requestOTPHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await requestOTP(email);
      
      // In development, show toast with OTP info
      if (process.env.NODE_ENV === 'development') {
        toast.success('OTP sent! Check console for development OTP');
      } else {
        toast.success('OTP sent to your email');
      }
      
      // Move to verification step
      setStep('verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request OTP');
      toast.error('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTPHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, otp);
      setLoginSuccess(true);
      toast.success('Login successful');
      
      // Router.push is handled in the login function
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP verification failed');
      toast.error('OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen on successful login
  if (loginSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-24 bg-slate-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Login Successful</h2>
          <div className="mb-4">Redirecting to dashboard...</div>
          <div className="w-10 h-10 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-slate-50">
      <div className="w-full max-w-md p-6 md:p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold">OM Transport Dashboard</h1>
          <h2 className="mt-2 text-sm md:text-base text-gray-600">Log in to your account</h2>
        </div>
        
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md border border-red-300 text-sm">
            {error}
          </div>
        )}
        
        {step === 'request' ? (
          <form onSubmit={requestOTPHandler} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={verifyOTPHandler} className="mt-6 space-y-4">
            <div>
              <p className="mb-3 text-sm text-gray-600">An OTP has been sent to your email. Please enter it below.</p>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                OTP Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Enter 6-digit code"
              />
            </div>
            
            <div className="flex flex-col space-y-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button
                type="button"
                onClick={() => setStep('request')}
                className="text-sm text-blue-600 hover:underline"
                disabled={loading}
              >
                Go back
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 