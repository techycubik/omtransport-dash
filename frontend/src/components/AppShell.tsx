'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, BarChart, Package, Hammer, Users, Truck, ShoppingBag, Palette, HardHat } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--steel-50))]">
        <div className="animate-pulse text-center">
          <div className="h-8 w-32 bg-[rgb(var(--navy-200))] rounded mx-auto mb-4"></div>
          <div className="h-4 w-48 bg-[rgb(var(--navy-100))] rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--steel-50))]">
        <div className="text-center">
          <div className="mb-4 text-[rgb(var(--steel-600))]">Redirecting to login page...</div>
          <div className="w-10 h-10 border-t-4 border-[rgb(var(--navy-500))] border-solid rounded-full animate-spin mx-auto"></div>
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
    { title: 'Design System', href: '/design-system', icon: <Palette size={18} /> },
    { title: 'Debug', href: '/debug', icon: <HardHat size={18} /> },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[rgb(var(--steel-50))]">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 bg-[rgb(var(--navy-500))] text-white py-3 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              className="md:hidden mr-3 text-white hover:bg-[rgb(var(--navy-600))] p-1.5 rounded-md transition-colors"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-lg md:text-xl font-bold flex items-center">
              <Truck className="mr-2 text-[rgb(var(--yellow-400))]" size={24} /> 
              <span className="text-white">OM</span>
              <span className="text-[rgb(var(--yellow-400))]">Transport</span>
            </h1>
          </div>
          
          {user && (
            <div className="flex items-center gap-3 md:gap-4">
              <span className="text-xs md:text-sm text-white/80 hidden sm:inline-block">
                {user.email}
              </span>
              <button 
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs md:text-sm text-white hover:bg-[rgb(var(--navy-600))] rounded-md transition-colors font-medium"
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
            md:translate-x-0 fixed md:static z-20 w-64 md:w-60 h-full bg-white shadow-md md:shadow-sm 
            border-r border-[rgb(var(--border))] transition-transform duration-300 ease-in-out
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
                          ? 'bg-[rgb(var(--navy-50))] text-[rgb(var(--navy-700))] font-medium' 
                          : 'text-[rgb(var(--steel-600))] hover:bg-[rgb(var(--steel-50))]'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className={`mr-3 ${isActive ? 'text-[rgb(var(--navy-500))]' : 'text-[rgb(var(--steel-400))]'}`}>
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
            {pageTitle && (
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-[rgb(var(--navy-500))]">{pageTitle}</h1>
                <div className="h-1 w-16 bg-[rgb(var(--yellow-400))] rounded mt-2"></div>
              </div>
            )}
            <div className="animate-fade-in">
              {children}
            </div>
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <footer className="bg-[rgb(var(--navy-500))] text-white py-3 md:py-4">
        <div className="container mx-auto px-4 text-center text-xs md:text-sm">
          &copy; {new Date().getFullYear()} OM Transport. All rights reserved.
        </div>
      </footer>
    </div>
  );
} 