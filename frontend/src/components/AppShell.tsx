'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, BarChart, Package, Hammer, Users, Truck, ShoppingBag, Shield } from 'lucide-react';

interface AppShellProps {
  children: ReactNode;
  pageTitle: string;
}

export default function AppShell({ children, pageTitle }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated, loading, initialized, isSuperAdmin } = useAuth();
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-center">
          <div className="h-8 w-32 bg-blue-200 rounded mx-auto mb-4"></div>
          <div className="h-4 w-48 bg-blue-100 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 text-gray-600">Redirecting to login page...</div>
          <div className="w-10 h-10 border-t-4 border-blue-600 border-solid rounded-full animate-spin mx-auto"></div>
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
  ];

  // Add admin management link for super admin
  const adminItems = isSuperAdmin ? [
    { title: 'Admin Management', href: '/dashboard/admin', icon: <Shield size={18} /> }
  ] : [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 bg-indigo-900 text-white py-4 shadow-md">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              className="md:hidden mr-3 text-white hover:bg-indigo-800 p-2 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg md:text-xl font-bold flex items-center">
              <Truck className="mr-3 text-yellow-400" size={26} /> 
              <span className="text-white font-bold">OM</span>
              <span className="text-yellow-400 font-bold">Transport</span>
            </h1>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/80 hidden sm:inline-block">
                {user.email}
              </span>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-indigo-800 hover:bg-indigo-700 text-white rounded-md transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>
      
      <div className="flex-1 flex relative">
        {/* Sidebar - Mobile */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/30" onClick={() => setMobileMenuOpen(false)}></div>
            
            {/* Sidebar panel */}
            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
              <div className="px-4 pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <Link href="/dashboard" className="flex items-center text-navy-500">
                    <Truck size={24} className="mr-2 text-yellow-400" />
                    <span className="text-xl font-bold">OM Transport</span>
                  </Link>
                  <button
                    type="button"
                    className="p-2 -mr-2 text-gray-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto pb-4">
                <nav className="space-y-1 px-2 mt-4">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  ))}
                  
                  {/* Admin section in mobile menu */}
                  {adminItems.length > 0 && (
                    <>
                      <div className="my-4 border-t border-gray-200 pt-4">
                        <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500">ADMINISTRATION</h3>
                        {adminItems.map((item) => (
                          <Link
                            key={item.title}
                            href={item.href}
                            className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {item.icon}
                            <span>{item.title}</span>
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </nav>
              </div>
            </div>
          </div>
        )}
        
        {/* Sidebar */}
        <aside 
          className={`
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
            md:translate-x-0 fixed md:static z-20 w-64 h-full bg-white shadow-md 
            border-r border-gray-200 transition-transform duration-300 ease-in-out
          `}
        >
          <nav className="p-5 mt-2 md:mt-0">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link 
                      href={item.href}
                      className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                        isActive 
                          ? 'bg-indigo-50 text-indigo-800 font-medium' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`mr-3 ${isActive ? 'text-indigo-700' : 'text-gray-500'}`}>
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
        <main className="flex-1 p-6 md:p-8 overflow-x-hidden bg-white">
          <div className="max-w-full overflow-hidden">
            {pageTitle && (
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">{pageTitle}</h1>
                <div className="h-1 w-16 bg-yellow-400 rounded mt-2"></div>
              </div>
            )}
            <div className="animate-fade-in">
              {children}
            </div>
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <footer className="bg-indigo-900 text-white py-4">
        <div className="container mx-auto px-6 text-center text-sm">
          &copy; {new Date().getFullYear()} OM Transport. All rights reserved.
        </div>
      </footer>
    </div>
  );
} 