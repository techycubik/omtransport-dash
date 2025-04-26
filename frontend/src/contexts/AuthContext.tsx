"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { setCookie, getCookie, deleteCookie } from '@/lib/cookies';

type User = {
  id: number;
  email: string;
  name?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';
};

type AuthState = {
  user: User | null;
  loading: boolean;
  initialized: boolean;
};

type AuthContextType = AuthState & {
  requestOTP: (email: string) => Promise<void>;
  login: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    initialized: false
  });
  const router = useRouter();

  useEffect(() => {
    // Check localStorage and cookies for user on mount
    const loadUser = () => {
      try {
        let user = null;
        
        // Try to get user from cookie first
        const userCookie = getCookie('user');
        if (userCookie) {
          user = JSON.parse(userCookie);
        } 
        // If not in cookie, try localStorage
        else {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            user = JSON.parse(storedUser);
            // Also set the cookie for next time
            setCookie('user', storedUser, 7);
          }
        }
        
        setState(prev => ({ ...prev, user, loading: false, initialized: true }));
      } catch (error) {
        console.error('Error loading user:', error);
        setState(prev => ({ ...prev, loading: false, initialized: true }));
      }
    };
    
    loadUser();
  }, []);

  const requestOTP = async (email: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const response = await api('/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to request OTP' }));
        throw new Error(errorData.error || 'Failed to request OTP');
      }

      setState(prev => ({ ...prev, loading: false }));
      return await response.json();
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      console.error('Request OTP error:', error);
      throw error;
    }
  };

  const login = async (email: string, otp: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const response = await api('/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'OTP verification failed' }));
        throw new Error(errorData.error || 'OTP verification failed');
      }

      const user = await response.json();
      const userStr = JSON.stringify(user);
      
      // Store user in both localStorage and cookie
      localStorage.setItem('user', userStr);
      setCookie('user', userStr, 7);
      
      // Update state first, then navigate after state is updated
      setState(prev => ({ ...prev, user, loading: false }));
      
      // Wait a moment to ensure state is updated before redirecting
      setTimeout(() => {
        // Double-check we're authenticated before redirecting
        if (user && user.id) {
          router.push('/dashboard');
        }
      }, 50);
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      await api('/auth/logout', { method: 'POST' });
      
      // Clear both localStorage and cookie
      localStorage.removeItem('user');
      deleteCookie('user');
      
      // Update state
      setState(prev => ({ ...prev, user: null, loading: false }));
      
      // Redirect to login after a small delay to ensure state is updated
      setTimeout(() => {
        router.push('/login');
      }, 50);
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    ...state,
    requestOTP,
    login,
    logout,
    isAuthenticated: !!state.user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return {
    ...context,
    isSuperAdmin: context.user?.role === 'SUPER_ADMIN',
    isAdmin: context.user?.role === 'ADMIN' || context.user?.role === 'SUPER_ADMIN'
  };
} 