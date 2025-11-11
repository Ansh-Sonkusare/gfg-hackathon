'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '../utils/trpc';

interface HeaderProps {
  showNavigation?: boolean;
}

export default function Header({ showNavigation = true }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();

  const userProfile = trpc.auth.getCurrentUser.useQuery();
  const borrowerProfile = trpc.borrower.getProfile.useQuery();

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    router.push('/login');
  };

  const user = userProfile.data;
  const balance = borrowerProfile.data?.currentBalance;

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="text-2xl mr-2">💎</span>
            <span className="text-xl font-bold text-gray-900">EduLend</span>
          </div>

          {showNavigation && (
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/borrower')}
                className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Borrow
              </button>
              <button
                onClick={() => router.push('/lender')}
                className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Lend
              </button>
            </nav>
          )}

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Balance</div>
              <div className="text-lg font-semibold text-gray-900">
                ₹{balance || '0'}
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 text-sm focus:outline-none"
              >
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-indigo-600">
                    {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      router.push('/dashboard');
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Dashboard
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      // TODO: Add wallet/transactions page
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Wallet & Transactions
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      // TODO: Add settings page
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </button>

                  <div className="border-t">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}