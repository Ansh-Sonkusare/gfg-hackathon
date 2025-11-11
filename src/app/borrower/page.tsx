'use client';

import { useEffect, useState } from 'react';
import './borrower.css';
import { trpc } from '../../utils/trpc';

export default function BorrowerDashboard() {
  const [isAnonymous, setIsAnonymous] = useState(false);

  // tRPC queries
  const borrowerProfile = trpc.borrower.getProfile.useQuery();
  const lenders = trpc.borrower.getLenders.useQuery();
  const activeLoans = trpc.borrower.getActiveLoans.useQuery();

  // tRPC mutations
  const requestLoanMutation = trpc.borrower.requestLoan.useMutation();
  const makePaymentMutation = trpc.borrower.makePayment.useMutation();

  // tRPC subscription (handled separately)
  const loanUpdates = trpc.borrower.onLoanUpdate.useSubscription();

  const borrowerData = borrowerProfile.data;

  useEffect(() => {
    // Initialize credit score animation
    const animateCreditScore = () => {
      if (!borrowerData) return;
      const circle = document.getElementById('scoreCircle');
      if (circle) {
        const circumference = 2 * Math.PI * 80;
        const offset = circumference - (borrowerData.creditScore / 1000) * circumference;
        circle.style.strokeDasharray = `${circumference}`;
        circle.style.strokeDashoffset = `${offset}`;
      }
    };

    if (borrowerData) {
      animateCreditScore();
    }
  }, [borrowerData]);

  useEffect(() => {
    if (loanUpdates.data && !loanUpdates.error) {
      // Refetch loans when loan updates are received
      activeLoans.refetch();
    }
  }, [loanUpdates.data, loanUpdates.error]);

  // Handle subscription errors separately
  useEffect(() => {
    if (loanUpdates.error) {
      console.error('Subscription error:', loanUpdates.error);
      // Could show a toast or notification here instead of blocking the page
    }
  }, [loanUpdates.error]);

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
    return <div>Error loading data: {borrowerProfile.error?.message || lenders.error?.message || activeLoans.error?.message}</div>;
  }

  if (!borrowerData) {
    return <div>No borrower data</div>;
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
              <div className="stat-value">{borrowerData?.currentBalance}</div>
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
          <div className="stat-card emergency">
            <div className="stat-icon">🚨</div>
            <div className="stat-content">
              <div className="stat-label">Emergency Credit</div>
              <div className="stat-value">{borrowerData?.emergencyCreditAvailable}</div>
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
                      <span>Available: {borrowerData.emergencyCreditAvailable}</span>
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
                <div className="history-item">
                  <div className="history-info">
                    <span className="history-amount">₹500</span>
                    <span className="history-status completed">Completed</span>
                  </div>
                  <div className="history-meta">
                    <span>0% Interest</span>
                    <span>•</span>
                    <span>Funded: Nov 01, 2025</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                    </div>
                    <button
                      className="btn btn-primary btn-full"
                      onClick={() => requestLoanMutation.mutate({ lenderId: lender.id, amount: 2000 })}
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
                        <span className="loan-value">{loan.amount}</span>
                      </div>
                      <div className="loan-info-item">
                        <span className="loan-label">Remaining</span>
                        <span className="loan-value">{loan.remaining}</span>
                      </div>
                      <div className="loan-info-item">
                        <span className="loan-label">Interest Rate</span>
                        <span className="loan-value">{loan.interestRate}</span>
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
                      onClick={() => makePaymentMutation.mutate({ loanId: loan.id, amount: parseInt(loan.dueAmount.replace('₹', '')) })}
                    >
                      Pay {loan.dueAmount}
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
                      <span className="score-number">{borrowerData.creditScore}</span>
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
                <button className="btn btn-outline" id="addFundsBtn">+ Add Funds</button>
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
                    <span className="transaction-amount debit">- ₹500</span>
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
          <button className="btn btn-primary btn-large" id="requestLoanBtn">
            <span>+ Request New Loan</span>
          </button>
        </section>
      </main>


    </>
  );
}
