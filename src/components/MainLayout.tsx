import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  TrendingDown,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Store,
  Bell,
  Building2,
  FileText,
  CreditCard
} from 'lucide-react';
import { useLogout } from '@/hooks/auth/useAuthHooks';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthStore();
  const logoutMutation = useLogout()
  const router = useRouter();
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Tableau de bord',
      href: '/dashboard',
      icon: LayoutDashboard,
      current: pathname === '/dashboard'
    },
    {
      name: 'Produits',
      href: '/products',
      icon: Package,
      current: pathname.startsWith('/products')
    },
    {
      name: 'Bons d\'Entrée',
      href: '/stock-entries',
      icon: TrendingUp,
      current: pathname.startsWith('/stock-entries')
    },
    {
      name: 'Bons de Sortie',
      href: '/stock-exits',
      icon: TrendingDown,
      current: pathname.startsWith('/stock-exits')
    },
    {
      name: 'Comptes',
      href: '/accounts',
      icon: Building2,
      current: pathname.startsWith('/accounts')
    },
    {
      name: 'Transactions',
      href: '/transactions',
      icon: CreditCard,
      current: pathname.startsWith('/transactions')
    },
    {
      name: 'Factures',
      href: '/invoices',
      icon: FileText,
      current: pathname.startsWith('/invoices')
    },
    {
      name: 'Clients',
      href: '/customers',
      icon: Users,
      current: pathname.startsWith('/customers')
    },
    {
      name: 'Paramètres',
      href: '/settings',
      icon: Settings,
      current: pathname.startsWith('/settings')
    }
  ];


  const handleNavigation = (href: string) => {
    router.push(href);
    setSidebarOpen(false);
  };

  return (
    <div className="h-screen flex-1 flex bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Store className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">GesStock</span>
            </div>
            <nav className="mt-8 px-2 space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`${
                    item.current
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full`}
                >
                  <item.icon
                    className={`${
                      item.current ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 flex-shrink-0 h-5 w-5`}
                  />
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.fullname?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.fullname}</p>
                <p className="text-xs text-gray-500">{user?.store.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <Store className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">GesStock</span>
              </div>
              <nav className="mt-8 flex-1 px-2 space-y-1">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className={`${
                      item.current
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full transition-colors`}
                  >
                    <item.icon
                      className={`${
                        item.current ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 flex-shrink-0 h-5 w-5`}
                    />
                    {item.name}
                  </button>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center w-full">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.fullname?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-700">{user?.fullname}</p>
                  <p className="text-xs text-gray-500">{user?.store.name}</p>
                </div>
                <button
                  onClick={_ => logoutMutation.mutate()}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 w-full">
        {/* Mobile header */}
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Desktop header */}
        <div className="hidden md:flex bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex-1 flex justify-between items-center">
            <div>
              {/* Page title will be set by individual pages */}
            </div>
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="text-gray-400 hover:text-gray-600 transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* Store info */}
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.fullname}</p>
                <p className="text-xs text-gray-500">{user?.store.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 w-full">
          <div className="h-full w-full py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
