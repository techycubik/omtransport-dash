'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCookie } from '@/lib/cookies';

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // Check if user is already logged in
    const userCookie = getCookie('user');
    const userLocal = localStorage.getItem('user');
    
    if (userCookie || userLocal) {
      setIsLoggedIn(true);
      // Redirect to dashboard if already logged in
      router.push('/dashboard');
    } else {
      // Optionally auto-redirect to login after a short delay
      const timer = setTimeout(() => {
        router.push('/login');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [router]);
  
  if (isLoggedIn) {
    return null; // Don't render anything while redirecting to dashboard
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-4xl font-bold mb-6">OM Transport Dashboard</h1>
      <p className="text-xl mb-8">Welcome to the transport management system</p>
      
      <div className="flex gap-4">
        <Link 
          href="/login" 
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Login to Dashboard
        </Link>
      </div>
      
      <p className="mt-8 text-gray-500">Redirecting to login page in 3 seconds...</p>
    </div>
  );
}
