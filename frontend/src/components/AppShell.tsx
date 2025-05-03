"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  Menu,
  X,
  BarChart,
  Package,
  Hammer,
  Users,
  Truck,
  ShoppingBag,
  Calendar,
  ChevronDown,
  Settings,
  Bell,
  User,
  LogOut,
  FileText,
  Activity,
  History,
} from "lucide-react";

interface AppShellProps {
  children: ReactNode;
  pageTitle: string;
}

export default function AppShell({ children, pageTitle }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated, loading, initialized, isAdmin, isSuperAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Set isClient to true when component mounts on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Use effect for authentication redirect
  useEffect(() => {
    if (initialized && !isAuthenticated && !loading) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router, initialized]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".user-menu-container")) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Display a loading indicator until we can determine authentication
  if (loading || !isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-center">
          <div className="h-8 w-32 bg-teal-100 rounded mx-auto mb-4"></div>
          <div className="h-4 w-48 bg-teal-50 rounded mx-auto"></div>
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
          <div className="w-10 h-10 border-t-4 border-teal-500 border-solid rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  const navigationItems = [
    { title: "Dashboard", href: "/dashboard", icon: <BarChart size={18} /> },
    { title: "Reports", href: "/reports", icon: <FileText size={18} /> },
    { title: "Materials", href: "/materials", icon: <Hammer size={18} /> },
    { title: "Customers", href: "/customers", icon: <Users size={18} /> },
    { title: "Vendors", href: "/vendors", icon: <Truck size={18} /> },
    { title: "Crusher", href: "/crusher", icon: <Activity size={18} /> },
    { title: "Sales Orders", href: "/sales", icon: <Package size={18} /> },
    { title: "Purchases", href: "/purchases", icon: <ShoppingBag size={18} /> },
    ...(isAdmin ? [{ title: "Users", href: "/dashboard/users", icon: <User size={18} /> }] : []),
    ...(isAdmin ? [{ title: "Audit Logs", href: "/dashboard/audit-logs", icon: <History size={18} /> }] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-gray-500 hover:bg-gray-100 p-2 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>

            <Link href="/dashboard" className="flex items-center">
              <Truck className="mr-2 text-teal-600" size={28} />
              <span className="text-xl font-semibold text-gray-900">
                OM Transport
              </span>
            </Link>
          </div>

          <div className="relative user-menu-container">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 font-medium">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <ChevronDown size={14} className="text-gray-500" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-md z-50">
                <div className="p-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-row overflow-hidden pt-16">
        {/* Sidebar - Mobile */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/30"
              onClick={() => setMobileMenuOpen(false)}
            ></div>

            {/* Sidebar panel */}
            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
              <div className="px-4 pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <Link
                    href="/dashboard"
                    className="flex items-center text-gray-900"
                  >
                    <Truck size={24} className="mr-2 text-teal-600" />
                    <span className="text-xl font-semibold">OM Transport</span>
                  </Link>
                  <button
                    type="button"
                    className="p-2 text-gray-500"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pb-4">
                <nav className="space-y-1 px-2 mt-4">
                  {navigationItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.title}
                        href={item.href}
                        className={`flex items-center px-3 py-2.5 rounded-md text-sm ${
                          isActive
                            ? "bg-teal-50 text-teal-700 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span
                          className={`mr-3 ${
                            isActive ? "text-teal-600" : "text-gray-500"
                          }`}
                        >
                          {item.icon}
                        </span>
                        {item.title}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar - Desktop */}
        <aside
          className="hidden md:block w-64 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto fixed top-16 left-0 bottom-0"
        >
          <nav className="p-3 pt-4">
            <ul className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-3 py-2.5 rounded-md text-sm transition-colors ${
                        isActive
                          ? "bg-teal-50 text-teal-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`mr-3 ${
                          isActive ? "text-teal-600" : "text-gray-500"
                        }`}
                      >
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

        {/* Main Content - Add left margin to accommodate fixed sidebar */}
        <main className="flex-1 overflow-auto p-6 md:p-8 bg-gray-50 md:ml-64">
          <div className="max-w-[1280px] mx-auto">
            {pageTitle && (
              <div className="mb-6">
                <h1 className="text-xl font-semibold text-gray-800">
                  {pageTitle}
                </h1>
              </div>
            )}
            <div className="animate-fade-in">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
