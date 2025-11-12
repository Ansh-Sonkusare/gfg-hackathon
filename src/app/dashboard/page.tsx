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
    <div className="min-h-screen bg-gray-900">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setCurrentView('overview')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                currentView === 'overview'
                  ? 'border-gray-400 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setCurrentView('borrow')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                currentView === 'borrow'
                  ? 'border-gray-400 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              Borrow Money
            </button>
            <button
              onClick={() => setCurrentView('lend')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                currentView === 'lend'
                  ? 'border-gray-400 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
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
            <div className="bg-black rounded-lg shadow p-6 border border-gray-600">
              <div className="flex items-center">
                <div className="p-2 bg-gray-700 rounded-lg">
                  <span className="text-gray-300">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Current Balance</p>
                  <p className="text-2xl font-bold text-white">
                    ₹{currentBalance || borrowerData?.currentBalance || lenderData?.walletBalance || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Active Loans Card */}
            <div className="bg-black rounded-lg shadow p-6 border border-gray-600">
              <div className="flex items-center">
                <div className="p-2 bg-gray-700 rounded-lg">
                  <span className="text-gray-300">📋</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Active Loans</p>
                  <p className="text-2xl font-bold text-white">
                    {(activeLoans.data?.length || 0) + (lenderLoans.data?.length || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Credit Score Card */}
            <div className="bg-black rounded-lg shadow p-6 border border-gray-600">
              <div className="flex items-center">
                <div className="p-2 bg-gray-700 rounded-lg">
                  <span className="text-gray-300">⭐</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Credit Score</p>
                  <p className="text-2xl font-bold text-white">
                    {borrowerData?.creditScore || lenderData?.trustScore?.split('/')[0] || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-black rounded-lg shadow p-6 md:col-span-2 lg:col-span-3 border border-gray-600">
              <h3 className="text-lg font-medium text-white mb-4">Recent Transactions</h3>
              <div className="space-y-3">
                {transactions.data && transactions.data.length > 0 ? (
                  transactions.data.slice(0, 5).map((txn, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-500 last:border-b-0">
                      <div>
                        <p className="text-sm font-medium text-white">{txn.type}</p>
                        <p className="text-xs text-gray-400">{txn.date}</p>
                      </div>
                      <span className={`text-sm font-medium ${txn.positive ? 'text-gray-300' : 'text-gray-400'}`}>
                        {txn.amount}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No transactions yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {currentView === 'borrow' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-4">Borrow Money</h2>
            <p className="text-gray-400 mb-8">Access loans from fellow students</p>
            <button
              onClick={() => router.push('/borrower')}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-500"
            >
              Go to Borrower Dashboard
            </button>
          </div>
        )}

        {currentView === 'lend' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-4">Lend Money</h2>
            <p className="text-gray-400 mb-8">Help fellow students and earn interest</p>
            <button
              onClick={() => router.push('/lender')}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-500"
            >
              Go to Lender Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}