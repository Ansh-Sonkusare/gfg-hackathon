'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '../../utils/trpc';
import Header from '../../components/Header';

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState<'overview' | 'borrow' | 'lend'>('overview');
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/login');
      return;
    }
  }, [router]);

  // tRPC queries
  const userProfile = trpc.auth.getCurrentUser.useQuery();
  const borrowerProfile = trpc.borrower.getProfile.useQuery();
  const lenderProfile = trpc.lender.getProfile.useQuery();
  const activeLoans = trpc.borrower.getActiveLoans.useQuery();
  const lenderLoans = trpc.lender.getActiveLoans.useQuery();
  const transactions = trpc.borrower.getTransactions.useQuery();

  // tRPC subscriptions
  const borrowerBalanceUpdate = trpc.borrower.onBalanceUpdate.useSubscription();
  const lenderBalanceUpdate = trpc.lender.onBalanceUpdate.useSubscription();

  // Update balance on subscription
  useEffect(() => {
    if (borrowerBalanceUpdate.data) {
      setCurrentBalance(borrowerBalanceUpdate.data.newBalance);
    }
  }, [borrowerBalanceUpdate.data]);

  useEffect(() => {
    if (lenderBalanceUpdate.data) {
      setCurrentBalance(lenderBalanceUpdate.data.newBalance);
    }
  }, [lenderBalanceUpdate.data]);

  // Set initial balance
  useEffect(() => {
    if (borrowerProfile.data && currentBalance === null) {
      setCurrentBalance(borrowerProfile.data.currentBalance);
    } else if (lenderProfile.data && currentBalance === null) {
      setCurrentBalance(lenderProfile.data.walletBalance);
    }
  }, [borrowerProfile.data, lenderProfile.data, currentBalance]);

  if (userProfile.isLoading || borrowerProfile.isLoading || lenderProfile.isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (userProfile.error) {
    return <div className="min-h-screen flex items-center justify-center">Error: {userProfile.error.message}</div>;
  }

  const user = userProfile.data;
  const borrowerData = borrowerProfile.data;
  const lenderData = lenderProfile.data;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setCurrentView('overview')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                currentView === 'overview'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setCurrentView('borrow')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                currentView === 'borrow'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Borrow Money
            </button>
            <button
              onClick={() => setCurrentView('lend')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                currentView === 'lend'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Lend Money
            </button>
          </nav>
        </div>

        {/* Content */}
        {currentView === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Balance Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-green-600">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Current Balance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{currentBalance || borrowerData?.currentBalance || lenderData?.walletBalance || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Active Loans Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-blue-600">📋</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Loans</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(activeLoans.data?.length || 0) + (lenderLoans.data?.length || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Credit Score Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <span className="text-yellow-600">⭐</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Credit Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {borrowerData?.creditScore || lenderData?.trustScore?.split('/')[0] || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow p-6 md:col-span-2 lg:col-span-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
              <div className="space-y-3">
                {transactions.data && transactions.data.length > 0 ? (
                  transactions.data.slice(0, 5).map((txn, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{txn.type}</p>
                        <p className="text-xs text-gray-500">{txn.date}</p>
                      </div>
                      <span className={`text-sm font-medium ${txn.positive ? 'text-green-600' : 'text-red-600'}`}>
                        {txn.amount}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No transactions yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {currentView === 'borrow' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Borrow Money</h2>
            <p className="text-gray-600 mb-8">Access loans from fellow students</p>
            <button
              onClick={() => router.push('/borrower')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
            >
              Go to Borrower Dashboard
            </button>
          </div>
        )}

        {currentView === 'lend' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Lend Money</h2>
            <p className="text-gray-600 mb-8">Help fellow students and earn interest</p>
            <button
              onClick={() => router.push('/lender')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
            >
              Go to Lender Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}