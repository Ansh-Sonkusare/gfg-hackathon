'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './borrower.css';
import { trpc } from '../../utils/trpc';
import { LenderWithAdvertisement } from '../../server/types';
import { toast } from 'sonner';

export default function BorrowerDashboard() {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [selectedLender, setSelectedLender] = useState<LenderWithAdvertisement | null>(null);
  const [loanAmount, setLoanAmount] = useState('');
  const [loanInterestRate, setLoanInterestRate] = useState('');
  const [loanDuration, setLoanDuration] = useState(7);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showManualPaymentModal, setShowManualPaymentModal] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);
  const [paymentFrequency, setPaymentFrequency] = useState('monthly');
  const [numberOfInstallments, setNumberOfInstallments] = useState(1);
  const [paymentAmount, setPaymentAmount] = useState('');
   const [manualPaymentAmount, setManualPaymentAmount] = useState('');
   const [showAddFundsModal, setShowAddFundsModal] = useState(false);
   const [addFundsAmount, setAddFundsAmount] = useState('');

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
  const borrowerProfile = trpc.borrower.getProfile.useQuery();
  const lenders = trpc.borrower.getLenders.useQuery();
  const activeLoans = trpc.borrower.getActiveLoans.useQuery();

  // tRPC subscriptions
  const balanceUpdate = trpc.borrower.onBalanceUpdate.useSubscription();

    // tRPC mutations
     const requestLoanMutation = trpc.borrower.requestLoan.useMutation({
       onSuccess: () => {
         setShowLoanModal(false);
         setSelectedLender(null);
         setLoanAmount('');
         setLoanInterestRate('');
         setLoanDuration(7);
         activeLoans.refetch();
       },
       onError: (error) => {
         toast.error(error.message);
       },
     });
     const makePaymentMutation = trpc.borrower.makePayment.useMutation({
       onSuccess: () => {
         activeLoans.refetch();
       },
       onError: (error) => {
         toast.error(error.message);
        },
     });
     const processPaymentMutation = trpc.borrower.processPayment.useMutation({
       onSuccess: (data) => {
         setShowManualPaymentModal(false);
         setManualPaymentAmount('');
         setCurrentBalance(data.newBalance);
         activeLoans.refetch();
         toast.success(data.message);
       },
       onError: (error) => {
         toast.error(error.message);
       },
      });
      const addFundsMutation = trpc.borrower.addFunds.useMutation({
        onSuccess: () => {
          setShowAddFundsModal(false);
          setAddFundsAmount('');
          borrowerProfile.refetch();
          toast.success('Funds added successfully');
        },
        onError: (error) => {
          toast.error(error.message);
        },
      });

   const borrowerData = borrowerProfile.data;

  // Update balance on subscription
  useEffect(() => {
    if (balanceUpdate.data) {
      setCurrentBalance(balanceUpdate.data.newBalance);
    }
  }, [balanceUpdate.data]);

  // Set initial balance
  useEffect(() => {
    if (borrowerProfile.data && currentBalance === null) {
      setCurrentBalance(borrowerProfile.data.currentBalance);
    }
  }, [borrowerProfile.data, currentBalance]);

  // Pre-fill loan form when lender is selected
  useEffect(() => {
    if (selectedLender) {
      setLoanInterestRate(selectedLender.interestRate.replace('%', ''));
      if (selectedLender.advertisement) {
        setLoanAmount(selectedLender.advertisement.minAmount.toString());
        setLoanDuration(selectedLender.advertisement.minDuration);
      }
    }
  }, [selectedLender]);

  const animateCreditScore = () => {
    if (!borrowerData) return;
    const circle = document.getElementById('scoreCircle');
    if (circle) {
      const circumference = 2 * Math.PI * 80;
      const offset = circumference - ((borrowerData?.creditScore || 0) / 1000) * circumference;
      circle.style.strokeDasharray = `${circumference}`;
      circle.style.strokeDashoffset = `${offset}`;
    }
  };

  useEffect(() => {
    // Initialize credit score animation
    if (borrowerData) {
      animateCreditScore();
    }
  }, [borrowerData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (borrowerProfile.isLoading || lenders.isLoading || activeLoans.isLoading) {
    return <div>Loading...</div>;
  }

  if (borrowerProfile.error || lenders.error || activeLoans.error) {
    return <div>Error loading data</div>;
  }

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">💎</span>
            <span className="logo-text">EduLend</span>
          </div>
          <nav className="nav">
            <a href="#" className="nav-link active">Dashboard</a>
            <a href="#" className="nav-link">Loans</a>
            <a href="#" className="nav-link">Lenders</a>
            <a href="#" className="nav-link">Wallet</a>
            <a href="#" className="nav-link">Settings</a>
          </nav>
          <div className="header-actions">
            <button className="icon-btn" id="notificationBtn">
              <span className="notification-dot"></span>
              🔔
            </button>
            <div className="user-avatar">AS</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Welcome Section */}
        <section className="welcome-section">
          <div className="welcome-text">
            <h1>Welcome back, <span className="highlight">{borrowerData?.name}</span></h1>
            <div className="trust-badge-display">
              <span className="badge verified">✓ Verified User</span>
              <span className="college-info">{borrowerData?.collegeName} | Year {borrowerData?.collegeYear}</span>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-label">Current Balance</div>
              <div className="stat-value">₹{currentBalance || borrowerData?.currentBalance || 0}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <div className="stat-label">Credit Score</div>
              <div className="stat-value credit-score">{borrowerData?.creditScore}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <div className="stat-label">Reputation</div>
              <div className="stat-value">{borrowerData?.reputation}</div>
            </div>
          </div>

        </section>

        {/* Emergency Credit Line */}
        <section className="emergency-section">
          <div className="card premium-card">
            <div className="card-header">
              <h2>⚡ Emergency Credit Line</h2>
              <span className="instant-badge">Instant Approval</span>
            </div>
            <div className="card-body">
              <div className="emergency-info">
                <div className="emergency-details">
                  <p className="emergency-desc">
                    Quick access to emergency funds (₹200 - ₹1,000) with instant auto-matching to available lenders.
                  </p>
                  <div className="emergency-features">
                    <div className="feature-item">
                      <span className="feature-icon">✓</span>
                      <span>Zero/Low Interest</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">✓</span>
                      <span>Auto-Match in seconds</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">✓</span>
                       <span>Available: ₹{borrowerData?.emergencyCreditAvailable || 0}</span>
                    </div>
                  </div>
                </div>
                <button
                  className="btn btn-primary"
                  id="requestEmergencyBtn"
                >
                  Request Emergency Loan
                </button>
              </div>
              <div className="emergency-history">
                <h4>Recent Emergency Loans</h4>
                <p className="no-history">No recent emergency loans</p>
              </div>

            </div>
          </div>
        </section>

        {/* Active Loans */}
        <section className="active-loans-section">
          <div className="card">
            <div className="card-header">
              <h2>💰 Your Active Loans</h2>
              <p className="subtitle">Track your ongoing loan repayments</p>
            </div>
            <div className="card-body">
              {activeLoans.data && activeLoans.data.length > 0 ? (
                <div className="loans-grid">
                  {activeLoans.data.map((loan: any) => (
                    <div key={loan.id} className="loan-card-modern">
                      <div className="loan-card-header">
                        <div className="loan-meta">
                          <div className="loan-id-modern">#{loan.id}</div>
                          <span className={`status-badge-modern ${loan.status.toLowerCase()}`}>
                            {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                          </span>
                        </div>
                        <div className="lender-info">
                          <span className="lender-icon">🏦</span>
                          <span className="lender-name">{loan.lenderName}</span>
                        </div>
                      </div>

                      <div className="loan-stats-grid">
                         <div className="stat-box">
                           <div className="stat-icon">💵</div>
                           <div className="stat-content">
                             <div className="stat-label">Loan Amount</div>
                             <div className="stat-value">₹{loan.amount}</div>
                           </div>
                         </div>
                         <div className="stat-box">
                           <div className="stat-icon">💰</div>
                           <div className="stat-content">
                             <div className="stat-label">Total Due</div>
                             <div className="stat-value">₹{loan.totalDueAmount}</div>
                           </div>
                         </div>
                         <div className="stat-box">
                           <div className="stat-icon">📉</div>
                           <div className="stat-content">
                             <div className="stat-label">Remaining</div>
                             <div className="stat-value">₹{loan.remaining}</div>
                           </div>
                         </div>
                        <div className="stat-box">
                          <div className="stat-icon">📅</div>
                          <div className="stat-content">
                            <div className="stat-label">Next Due</div>
                            <div className="stat-value">{formatDate(loan.nextDueDate)}</div>
                          </div>
                        </div>
                        <div className="stat-box">
                          <div className="stat-icon">🎯</div>
                          <div className="stat-content">
                            <div className="stat-label">Due Amount</div>
                            <div className="stat-value highlight">₹{loan.dueAmount}</div>
                          </div>
                        </div>
                      </div>

                      <div className="progress-section">
                        <div className="progress-info">
                          <span className="progress-label">Repayment Progress</span>
                          <span className="progress-percent">{loan.progressPercent}%</span>
                        </div>
                        <div className="progress-bar-modern">
                          <div
                            className="progress-fill-modern"
                            style={{ width: `${loan.progressPercent}%` }}
                          ></div>
                        </div>
                      </div>

                       <div className="loan-actions">
                         <button
                           className="btn btn-secondary btn-half"
                           onClick={() => {
                             setSelectedLoanId(loan.id);
                             setManualPaymentAmount('');
                             setShowManualPaymentModal(true);
                           }}
                         >
                           Pay Now
                         </button>
                         <button
                           className="btn btn-primary btn-half"
                           onClick={() => {
                             setSelectedLoanId(loan.id);
                             setPaymentAmount(loan.dueAmount.toString());
                             setShowPaymentModal(true);
                           }}
                         >
                           Set Payment Plan
                         </button>
                       </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3>No Active Loans</h3>
                   <p>You don&apos;t have any active loans at the moment.</p>
                  <button className="btn btn-primary" onClick={() => setShowLoanModal(true)}>
                    Request New Loan
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Request New Loan */}
        <section className="request-loan-section">
          <button className="btn btn-primary btn-large" onClick={() => setShowLoanModal(true)}>
            <span>+ Request New Loan</span>
          </button>
        </section>

        {/* Recommended Lenders */}
        <section className="lenders-section">
          <div className="card">
            <div className="card-header">
              <h2>🎯 Recommended Lenders for You</h2>
              <p className="subtitle">Matched based on repayment history, college affiliation &amp; risk profile</p>
            </div>
            <div className="card-body">
              <div className="lenders-grid" id="lendersGrid">
                {lenders.data?.map((lender: any) => (
                  <div key={lender.id} className="lender-card">
                    <div className="match-score">{lender.matchPercentage}% Match</div>
                    <div className="lender-header">
                      <div className="lender-avatar">{lender.profileImage}</div>
                      <div className="lender-info">
                        <h3>{lender.name}{lender.trustBadge && <span style={{ color: '#4caf50', marginLeft: '0.5rem' }}>✓</span>}</h3>
                        <div className="lender-meta">
                          {lender.collegeName ? lender.collegeName + ' | ' : ''}
                          {lender.branch ? lender.branch : ''}
                          {lender.collegeYear ? 'Year ' + lender.collegeYear : ''}
                        </div>
                      </div>
                    </div>
                     <div className="lender-details">
                       <div className="detail-box">
                         <span className="detail-label">Risk Tolerance</span>
                         <span className={`risk-badge ${lender.riskTolerance.toLowerCase()}`}>{lender.riskTolerance}</span>
                       </div>
                       <div className="detail-box">
                         <span className="detail-label">Interest Rate</span>
                         <span className="detail-value">{lender.interestRate}</span>
                       </div>
                       {lender.advertisement && (
                         <div className="detail-box">
                           <span className="detail-label">Loan Range</span>
                           <span className="detail-value">₹{lender.advertisement.minAmount} - ₹{lender.advertisement.maxAmount}</span>
                         </div>
                       )}
                     </div>
                      {lender.advertisement && (
                        <div className="advertisement-preview">
                          <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: 'var(--silver-medium)' }}>
                            <span>Duration: {lender.advertisement.minDuration}-{lender.advertisement.maxDuration} days</span>
                            <span>Target: {lender.advertisement.targetAudience}</span>
                          </div>
                        </div>
                      )}
                      <button
                        className="btn btn-primary btn-full"
                        onClick={() => {
                          setSelectedLender(lender);
                          setShowLoanModal(true);
                        }}
                      >
                        Request Loan
                      </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Group Lending */}
        <section className="group-lending-section">
          <div className="card">
            <div className="card-header">
              <h2>👥 Group Lending &amp; Shared Repayment</h2>
              <button className="btn btn-secondary" id="createGroupBtn">+ Create Group Loan</button>
            </div>
            <div className="card-body">
              <div className="group-loan-card">
                <div className="group-header">
                  <div className="group-info">
                    <h3>Tech Startup Bytes</h3>
                    <span className="group-type">Startup Project</span>
                  </div>
                  <span className="status-badge active">Active</span>
                </div>
                <div className="group-details">
                  <div className="detail-item">
                    <span className="detail-label">Total Loan</span>
                    <span className="detail-value">₹25,000</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Per Member</span>
                    <span className="detail-value">₹6,250</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Members</span>
                    <span className="detail-value">4 Students</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Next Due</span>
                    <span className="detail-value">Dec 01, 2025</span>
                  </div>
                </div>
                <div className="group-members">
                  <div className="member-avatars">
                    <div className="member-avatar">AS</div>
                    <div className="member-avatar">RK</div>
                    <div className="member-avatar">PV</div>
                    <div className="member-avatar">NK</div>
                  </div>
                  <span className="shared-responsibility">Shared Repayment Responsibility</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Anonymous Lending Toggle */}
        <section className="anonymous-section">
          <div className="card glass-card">
            <div className="card-body">
              <div className="anonymous-content">
                <div className="anonymous-info">
                  <h3>🎭 Anonymous Lending Layer</h3>
                  <p>Your identity will be hidden from lenders. Only credit scores and repayment records will be visible.</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" id="anonymousToggle" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Active Loans */}
        <section className="active-loans-section">
          <div className="card">
            <div className="card-header">
              <h2>📋 Active Loans</h2>
            </div>
            <div className="card-body">
              <div className="loans-list" id="activeLoansContainer">
                {activeLoans.data?.map((loan: any) => (
                  <div key={loan.id} className="loan-card">
                    <div className="loan-header">
                      <div className="loan-lender">{loan.lenderName}</div>
                      <span className={`status-badge ${loan.status}`}>{loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}</span>
                    </div>
                    <div className="loan-info-grid">
                      <div className="loan-info-item">
                        <span className="loan-label">Loan Amount</span>
                        <span className="loan-value">₹{loan.amount}</span>
                      </div>
                      <div className="loan-info-item">
                        <span className="loan-label">Remaining</span>
                        <span className="loan-value">₹{loan.remaining}</span>
                      </div>
                      <div className="loan-info-item">
                        <span className="loan-label">Interest Rate</span>
                        <span className="loan-value">{loan.interestRate}%</span>
                      </div>
                      <div className="loan-info-item">
                        <span className="loan-label">Next Due</span>
                        <span className="loan-value">{formatDate(loan.nextDueDate)}</span>
                      </div>
                    </div>
                    <div className="loan-progress">
                      <div className="progress-header">
                        <span>Repayment Progress</span>
                        <span>{loan.progressPercent}%</span>
                      </div>
                      <div className="progress-bar-container">
                        <div className="progress-bar-fill" style={{ width: `${loan.progressPercent}%` }}></div>
                      </div>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setSelectedLoanId(loan.id);
                        setPaymentAmount(loan.dueAmount.toString());
                        setShowPaymentModal(true);
                      }}
                    >
                      Set Payment Plan
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Credit Score & Wallet Row */}
        <div className="two-column-section">
          {/* Credit Score */}
          <section className="credit-score-section">
            <div className="card">
              <div className="card-header">
                <h2>📊 EduCIBIL Score</h2>
              </div>
              <div className="card-body">
                <div className="credit-score-display">
                  <div className="score-circle">
                    <svg viewBox="0 0 200 200">
                      <circle cx="100" cy="100" r="80" className="score-bg"></circle>
                      <circle cx="100" cy="100" r="80" className="score-progress" id="scoreCircle"></circle>
                    </svg>
                    <div className="score-text">
                       <span className="score-number">{borrowerData?.creditScore || 0}</span>
                      <span className="score-rating">Excellent</span>
                    </div>
                  </div>
                </div>
                <div className="score-breakdown">
                  <div className="breakdown-item">
                    <div className="breakdown-header">
                      <span>Payment History</span>
                      <span>95%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '95%' }}></div>
                    </div>
                  </div>
                  <div className="breakdown-item">
                    <div className="breakdown-header">
                      <span>Group Lending</span>
                      <span>88%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '88%' }}></div>
                    </div>
                  </div>
                  <div className="breakdown-item">
                    <div className="breakdown-header">
                      <span>Verification</span>
                      <span>100%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  <div className="breakdown-item">
                    <div className="breakdown-header">
                      <span>Trust Score</span>
                      <span>92%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Wallet */}
          <section className="wallet-section">
            <div className="card">
              <div className="card-header">
                <h2>💳 Wallet</h2>
              </div>
              <div className="card-body">
                <div className="wallet-balance">
                  <span className="wallet-label">Available Balance</span>
                  <span className="wallet-amount">₹3,450</span>
                </div>
                <button className="btn btn-outline" id="addFundsBtn" onClick={() => setShowAddFundsModal(true)}>+ Add Funds</button>
                <div className="wallet-actions">
                  <h4>Quick Actions</h4>
                  <button className="action-btn">Withdraw</button>
                  <button className="action-btn">Transfer</button>
                  <button className="action-btn">History</button>
                </div>
                <div className="recent-transactions">
                  <h4>Recent Transactions</h4>
                  <div className="transaction-item">
                    <div className="transaction-info">
                      <span className="transaction-type">Loan Payment</span>
                      <span className="transaction-date">Nov 05, 2025</span>
                    </div>
                    <span className="transaction-amount debit">-₹500</span>
                  </div>
                  <div className="transaction-item">
                    <div className="transaction-info">
                      <span className="transaction-type">Wallet Recharge</span>
                      <span className="transaction-date">Nov 03, 2025</span>
                    </div>
                    <span className="transaction-amount credit">+ ₹2,000</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Verification Status */}
        <section className="verification-section">
          <div className="card glass-card">
            <div className="card-header">
              <h2>🔒 Verification &amp; Security</h2>
              <span className="trust-level">Enhanced Trust Level</span>
            </div>
            <div className="card-body">
              <div className="verification-grid">
                <div className="verification-item verified">
                  <span className="verify-icon">✓</span>
                  <div className="verify-info">
                    <span className="verify-label">College ID</span>
                    <span className="verify-status">Verified</span>
                  </div>
                </div>
                <div className="verification-item verified">
                  <span className="verify-icon">✓</span>
                  <div className="verify-info">
                    <span className="verify-label">Institutional Email</span>
                    <span className="verify-status">Verified</span>
                  </div>
                </div>
                <div className="verification-item pending">
                  <span className="verify-icon">⏳</span>
                  <div className="verify-info">
                    <span className="verify-label">ID Upload (Optional)</span>
                    <span className="verify-status">Pending</span>
                  </div>
                  <button className="btn btn-sm" id="uploadIdBtn">Upload ID</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Request New Loan */}
         <section className="request-loan-section">
           <button className="btn btn-primary btn-large" onClick={() => setShowLoanModal(true)}>
             <span>+ Request New Loan</span>
           </button>
         </section>
      </main>

      {/* Loan Request Modal */}
      {showLoanModal && (
         <div className="modal-overlay" onClick={() => {
           setShowLoanModal(false);
           setSelectedLender(null);
         }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Request Loan{selectedLender ? ` from ${selectedLender.name}` : ' (Open Request)'}</h2>
                <button className="modal-close" onClick={() => {
                  setShowLoanModal(false);
                  setSelectedLender(null);
                }}>×</button>
              </div>
               <form onSubmit={(e) => {
                 e.preventDefault();
                 if (loanAmount && loanInterestRate) {
                   requestLoanMutation.mutate({
                     lenderId: selectedLender?.id,
                     amount: parseInt(loanAmount),
                     duration: loanDuration,
                     interestRate: parseFloat(loanInterestRate)
                   });
                 }
               }}>
               <div className="modal-body">
                  <div className="form-group">
                    <label>Principal Amount (₹)</label>
                    <input
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      placeholder={selectedLender?.advertisement ? `₹${selectedLender.advertisement.minAmount} - ₹${selectedLender.advertisement.maxAmount}` : "Enter principal amount"}
                      min={selectedLender?.advertisement?.minAmount || 100}
                      max={selectedLender?.advertisement?.maxAmount || 10000}
                      required
                    />
                  </div>
                   <div className="form-group">
                     <label>Interest Rate (%)</label>
                     <input
                       type="number"
                       value={loanInterestRate}
                       onChange={(e) => setLoanInterestRate(e.target.value)}
                       placeholder={selectedLender ? "Rate from lender advertisement" : "Enter interest rate (e.g., 5.5)"}
                       min="0"
                       max="50"
                       step="0.1"
                       required
                       readOnly={!!selectedLender}
                     />
                   </div>
                  <div className="form-group">
                    <label>Duration (Days)</label>
                    <input
                      type="number"
                      value={loanDuration}
                      onChange={(e) => setLoanDuration(parseInt(e.target.value))}
                      placeholder={selectedLender?.advertisement ? `${selectedLender.advertisement.minDuration}-${selectedLender.advertisement.maxDuration} days` : "Enter duration in days"}
                      min={selectedLender?.advertisement?.minDuration || 1}
                      max={selectedLender?.advertisement?.maxDuration || 365}
                      required
                    />
                  </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowLoanModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={requestLoanMutation.isPending}>
                  {requestLoanMutation.isPending ? 'Requesting...' : 'Request Loan'}
                </button>
              </div>
            </form>
          </div>
        </div>
        )}

         {/* Payment Plan Modal */}
         {showPaymentModal && (
           <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
             <div className="modal-content" onClick={(e) => e.stopPropagation()}>
               <div className="modal-header">
                 <h2>Set Payment Plan</h2>
                 <button className="modal-close" onClick={() => setShowPaymentModal(false)}>×</button>
               </div>
               <form onSubmit={(e) => {
                 e.preventDefault();
                 if (selectedLoanId && paymentAmount && paymentFrequency && numberOfInstallments) {
                   makePaymentMutation.mutate({
                     loanId: selectedLoanId,
                     amount: parseInt(paymentAmount),
                     frequency: paymentFrequency,
                     numberOfInstallments: numberOfInstallments
                   });
                   setShowPaymentModal(false);
                   setSelectedLoanId(null);
                   setPaymentAmount('');
                   setPaymentFrequency('monthly');
                   setNumberOfInstallments(1);
                 }
               }}>
                 <div className="modal-body">
                   <div className="form-group">
                     <label>Payment Amount (₹)</label>
                     <input
                       type="number"
                       value={paymentAmount}
                       onChange={(e) => setPaymentAmount(e.target.value)}
                       placeholder="Enter payment amount"
                       min="1"
                       required
                     />
                   </div>
                   <div className="form-group">
                     <label>Payment Frequency</label>
                      <select
                        value={paymentFrequency}
                        onChange={(e) => setPaymentFrequency(e.target.value)}
                        required
                      >
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                   </div>
                   <div className="form-group">
                     <label>Number of Installments</label>
                     <input
                       type="number"
                       value={numberOfInstallments}
                       onChange={(e) => setNumberOfInstallments(parseInt(e.target.value))}
                       placeholder="Enter number of payments"
                       min="1"
                       max="100"
                       required
                     />
                   </div>
                 </div>
                 <div className="modal-footer">
                   <button type="button" className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>
                     Cancel
                   </button>
                   <button type="submit" className="btn btn-primary" disabled={makePaymentMutation.isPending}>
                     {makePaymentMutation.isPending ? 'Creating Plan...' : 'Create Payment Plan'}
                   </button>
                 </div>
               </form>
             </div>
           </div>
         )}

         {/* Manual Payment Modal */}
         {showManualPaymentModal && (
           <div className="modal-overlay" onClick={() => setShowManualPaymentModal(false)}>
             <div className="modal-content" onClick={(e) => e.stopPropagation()}>
               <div className="modal-header">
                 <h2>Make Payment</h2>
                 <button className="modal-close" onClick={() => setShowManualPaymentModal(false)}>×</button>
               </div>
               <div className="modal-body">
                 <div className="payment-info">
                   <div className="balance-display">
                     <span className="balance-label">Your Balance:</span>
                     <span className="balance-amount">₹{currentBalance || borrowerData?.currentBalance || 0}</span>
                   </div>
                   {selectedLoanId && activeLoans.data && (
                     <div className="loan-payment-info">
                       <h4>Loan #{selectedLoanId}</h4>
                       <div className="payment-details">
                         <div className="detail-item">
                           <span>Remaining Amount:</span>
                           <span>₹{activeLoans.data.find((loan: any) => loan.id === selectedLoanId)?.remaining || 0}</span>
                         </div>
                         <div className="detail-item">
                           <span>Due Amount:</span>
                           <span>₹{activeLoans.data.find((loan: any) => loan.id === selectedLoanId)?.dueAmount || 0}</span>
                         </div>
                       </div>
                     </div>
                   )}
                 </div>
                 <form onSubmit={(e) => {
                   e.preventDefault();
                   if (selectedLoanId && manualPaymentAmount) {
                     const amount = parseInt(manualPaymentAmount);
                     if (amount > (currentBalance || borrowerData?.currentBalance || 0)) {
                       toast.error('Insufficient balance');
                       return;
                     }
                     processPaymentMutation.mutate({
                       loanId: selectedLoanId,
                       amount: amount
                     });
                   }
                 }}>
                   <div className="form-group">
                     <label>Payment Amount (₹)</label>
                     <input
                       type="number"
                       value={manualPaymentAmount}
                       onChange={(e) => setManualPaymentAmount(e.target.value)}
                       placeholder="Enter payment amount"
                       min="1"
                       max={currentBalance || borrowerData?.currentBalance || 0}
                       required
                     />
                   </div>
                   <div className="modal-footer">
                     <button type="button" className="btn btn-secondary" onClick={() => setShowManualPaymentModal(false)}>
                       Cancel
                     </button>
                     <button type="submit" className="btn btn-primary" disabled={processPaymentMutation.isPending}>
                       {processPaymentMutation.isPending ? 'Processing...' : 'Pay Now'}
                     </button>
                   </div>
                 </form>
               </div>
             </div>
            </div>
          )}

          {/* Add Funds Modal */}
          {showAddFundsModal && (
            <div className="modal-overlay" onClick={() => setShowAddFundsModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Add Funds to Wallet</h2>
                  <button className="modal-close" onClick={() => setShowAddFundsModal(false)}>×</button>
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (addFundsAmount) {
                    addFundsMutation.mutate({
                      amount: parseInt(addFundsAmount)
                    });
                  }
                }}>
                  <div className="modal-body">
                    <div className="form-group">
                      <label>Amount to Add (₹)</label>
                      <input
                        type="number"
                        value={addFundsAmount}
                        onChange={(e) => setAddFundsAmount(e.target.value)}
                        placeholder="Enter amount"
                        min="1"
                        max="100000"
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddFundsModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={addFundsMutation.isPending}>
                      {addFundsMutation.isPending ? 'Adding Funds...' : 'Add Funds'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

    </>
  );
}
