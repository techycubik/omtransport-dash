'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, BarChart, Package, Hammer, Users, Truck, ShoppingBag } from 'lucide-react';

interface AppShellProps {
  children: ReactNode;
  pageTitle: string;
}

export default function AppShell({ children, pageTitle }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated, loading, initialized } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true when component mounts on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Use effect for authentication redirect
  useEffect(() => {
    if (initialized && !isAuthenticated && !loading) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router, initialized]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Display a loading indicator until we can determine authentication
  if (loading || !isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-center">
          <div className="h-8 w-32 bg-indigo-200 rounded mx-auto mb-4"></div>
          <div className="h-4 w-48 bg-indigo-100 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 text-slate-600">Redirecting to login page...</div>
          <div className="w-10 h-10 border-t-4 border-indigo-500 border-solid rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  const navigationItems = [
    { title: 'Dashboard', href: '/dashboard', icon: <BarChart size={18} /> },
    { title: 'Sales Orders', href: '/sales', icon: <Package size={18} /> },
    { title: 'Materials', href: '/materials', icon: <Hammer size={18} /> },
    { title: 'Customers', href: '/customers', icon: <Users size={18} /> },
    { title: 'Vendors', href: '/vendors', icon: <Truck size={18} /> },
    { title: 'Purchases', href: '/purchases', icon: <ShoppingBag size={18} /> },
    { title: 'Debug', href: '/debug', icon: <span className="text-sm">🐛</span> },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 py-3 shadow-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              className="md:hidden mr-3 text-gray-700 hover:bg-gray-100 p-1.5 rounded-md"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 text-transparent bg-clip-text">OmTransport</h1>
          </div>
          
          {user && (
            <div className="flex items-center gap-3 md:gap-4">
              <span className="text-xs md:text-sm text-gray-600 hidden sm:inline-block">
                {user.email}
              </span>
              <button 
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs md:text-sm text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>
      
      <div className="flex-1 flex relative">
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-20 z-20 md:hidden"
            onClick={toggleMobileMenu}
          />
        )}
        
        {/* Sidebar */}
        <aside 
          className={`
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
            md:translate-x-0 fixed md:static z-20 w-64 md:w-60 h-full bg-white shadow-lg md:shadow-none 
            border-r border-gray-200 transition-transform duration-300 ease-in-out
          `}
        >
          <nav className="p-4 mt-2 md:mt-0">
            <ul className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link 
                      href={item.href}
                      className={`flex items-center px-4 py-2.5 rounded-md transition-colors ${
                        isActive 
                          ? 'bg-indigo-50 text-indigo-700 font-medium' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className={`mr-3 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>
                        {item.icon}
                      </span>
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <div className="max-w-full overflow-hidden">
            {children}
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-3 md:py-4">
        <div className="container mx-auto px-4 text-center text-xs md:text-sm text-gray-500">
          &copy; {new Date().getFullYear()} OmTransport. All rights reserved.
        </div>
      </footer>
    </div>
  );
} 