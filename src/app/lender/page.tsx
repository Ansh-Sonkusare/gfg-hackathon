"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "../../utils/trpc";
import "../borrower/borrower.css";
import "./lender.css";
import AdvertisementModal from "./AdvertisementModal";
import { toast } from "sonner";

export default function LenderDashboard() {
  const [currentPage, setCurrentPage] = useState("home");
  const [riskFilter, setRiskFilter] = useState("all");
  const [amountFilter, setAmountFilter] = useState("all");
  const [durationFilter, setDurationFilter] = useState("all");
  const [collegeFilter, setCollegeFilter] = useState("all");
    const [showBalanceModal, setShowBalanceModal] = useState(false);
    const [showAdModal, setShowAdModal] = useState(false);
    const [showAddFundsModal, setShowAddFundsModal] = useState(false);
    const [addFundsAmount, setAddFundsAmount] = useState('');
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
  const lenderProfile = trpc.lender.getProfile.useQuery();
  const loanRequests = trpc.lender.getLoanRequests.useQuery();
  const activeLoans = trpc.lender.getActiveLoans.useQuery();
  const transactions = trpc.lender.getTransactions.useQuery();
  const filteredLoanRequests = trpc.lender.updateFilters.useQuery({
    riskFilter,
    amountFilter,
    durationFilter,
    collegeFilter,
  });

   // tRPC mutations
    const fundLoanMutation = trpc.lender.fundLoan.useMutation({
      onSuccess: () => {
        loanRequests.refetch();
        activeLoans.refetch();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
    const addFundsMutation = trpc.lender.addFunds.useMutation({
      onSuccess: () => {
        setShowAddFundsModal(false);
        setAddFundsAmount('');
        lenderProfile.refetch();
        toast.success('Funds added successfully');
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

   // tRPC subscriptions
  const loanUpdates = trpc.lender.onLoanUpdate.useSubscription();
  const balanceUpdate = trpc.lender.onBalanceUpdate.useSubscription();

  const refetchLoans = useCallback(() => {
    if (loanUpdates.data) {
      activeLoans.refetch();
      loanRequests.refetch();
      filteredLoanRequests.refetch();
    }
  }, [loanUpdates.data, activeLoans, loanRequests, filteredLoanRequests]);

  // Update balance on subscription
  useEffect(() => {
    if (balanceUpdate.data) {
      setCurrentBalance(balanceUpdate.data.newBalance);
    }
  }, [balanceUpdate.data]);

  // Set initial balance
  useEffect(() => {
    if (lenderProfile.data && currentBalance === null) {
      setCurrentBalance(lenderProfile.data.walletBalance);
    }
  }, [lenderProfile.data, currentBalance]);

  useEffect(() => {
    refetchLoans();
  }, [refetchLoans]);

  const lenderData = lenderProfile.data;

  if (lenderProfile.isLoading || loanRequests.isLoading || activeLoans.isLoading || transactions.isLoading) {
    return <div>Loading...</div>;
  }

  if (lenderProfile.error || loanRequests.error || activeLoans.error || transactions.error) {
    return <div>Error loading data</div>;
  }

  if (!lenderData) {
    return <div>No lender data</div>;
  }





  const updateStats = () => {
    // Stats are already in the data
  };

  const renderBadges = () => {
    const badges = [
      { name: "First Loan", icon: "🎯", unlocked: true },
      { name: "Trusted Lender", icon: "⭐", unlocked: true },
      { name: "Risk Manager", icon: "🛡️", unlocked: true },
      { name: "Community Helper", icon: "🤝", unlocked: false },
      { name: "Gold Standard", icon: "🥇", unlocked: false },
      { name: "Mentor", icon: "👨‍🏫", unlocked: false },
    ];

    // Badges are rendered in JSX
  };

  const renderActiveLoans = () => {
    // Loans are rendered in JSX
  };

  const renderTransactions = () => {
    // Transactions are rendered in JSX
  };

  const showPage = (pageName: string) => {
    setCurrentPage(pageName);
    document.querySelectorAll(".page-section").forEach((section) => {
      section.classList.remove("active");
    });
    document.getElementById(`${pageName}Page`)?.classList.add("active");

    document.querySelectorAll(".nav-menu a").forEach((link) => {
      link.classList.remove("active");
    });
    document
      .querySelector(`[data-page="${pageName}"]`)
      ?.classList.add("active");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      {/* Top Navigation */}
      <nav className="top-nav">
        <div className="nav-brand">EduLend</div>
        <ul className="nav-menu">
          <li>
            <a
              data-page="home"
              className="active"
              onClick={() => showPage("home")}
            >
              Dashboard
            </a>
          </li>
          <li>
            <a data-page="lending" onClick={() => showPage("lending")}>
              Lending Hub
            </a>
          </li>
          <li>
            <a data-page="loans" onClick={() => showPage("loans")}>
              Active Loans
            </a>
          </li>
          <li>
            <a
              data-page="gamification"
              onClick={() => showPage("gamification")}
            >
              Achievements
            </a>
          </li>
          <li>
            <a data-page="wallet" onClick={() => showPage("wallet")}>
              Wallet
            </a>
          </li>
          <li>
            <a data-page="profile" onClick={() => showPage("profile")}>
              Profile
            </a>
          </li>
        </ul>
        <div className="nav-user">
          <div className="user-avatar" id="navAvatar">
            👨‍💼
          </div>
          <span id="navUserName">{lenderData.name}</span>
          <button
            className="balance-btn"
            onClick={() => setShowBalanceModal(true)}
            title="View Balance"
          >
            💰
          </button>
        </div>
      </nav>

      <div className="container">
        {/* Home Section */}
        <section id="homePage" className="page-section active">
          <div className="section-header">
            <h2>
              Welcome back, <span id="userName">{lenderData.name}</span>! 👋
            </h2>
             <p>Here&apos;s your lending portfolio overview</p>
          </div>

          {/* EduCIBIL Score Card */}
          <div className="educibil-card">
            <div className="educibil-header">
              <div>
                <h3>Your EduCIBIL Score</h3>
                <p style={{ color: "var(--silver-medium)", fontSize: "14px" }}>
                  Credit score updates in real-time based on your activity
                </p>
              </div>
              <div className="educibil-score silver" id="mainScore">
                {lenderData.trustScore.split("/")[0]}
              </div>
            </div>
            <div className="score-breakdown">
              <div className="score-item">
                <span className="score-item-label">On-Time Repayments</span>
                <span className="score-item-value" id="onTimeRate">
                  95%
                </span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    id="onTimeProgress"
                    style={{ width: "95%" }}
                  ></div>
                </div>
              </div>
              <div className="score-item">
                <span className="score-item-label">Lending Activity</span>
                <span className="score-item-value" id="lendingActivity">
                  22/30
                </span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "73%" }}></div>
                </div>
              </div>
              <div className="score-item">
                <span className="score-item-label">User Reviews</span>
                <span className="score-item-value" id="reviewRating">
                  4.6/5 ⭐
                </span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "92%" }}></div>
                </div>
              </div>
              <div className="score-item">
                <span className="score-item-label">Transactions</span>
                <span className="score-item-value" id="transactionCount">
                  18
                </span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "18%" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Wallet Balance</div>
               <div className="stat-value" id="walletBalance">
                 ₹{currentBalance || lenderData.walletBalance}
               </div>
              <div className="stat-change">Available to lend</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Lent</div>
               <div className="stat-value" id="totalLent">
                 ₹{lenderData.totalLent}
               </div>
              <div className="stat-change">+₹2,000 this month</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Active Loans</div>
              <div className="stat-value" id="activeLoans">
                {lenderData.activeLoans}
              </div>
              <div className="stat-change">3 due this week</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Default Rate</div>
              <div className="stat-value" id="defaultRate">
                {lenderData.defaultRatePercent}
              </div>
              <div className="stat-change">Industry avg: 5.2%</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Monthly Earnings</div>
              <div className="stat-value" id="monthlyEarnings">
                {lenderData.monthlyEarnings}
              </div>
              <div className="stat-change">From interest</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Current Level</div>
              <div className="stat-value" id="currentLevel">
                {lenderData.currentLevel}
              </div>
              <div className="stat-change">
                {lenderData.levelProgress} XP to Gold
              </div>
            </div>
           </div>

            {/* Active Loans */}
            <div className="active-loans-section">
              <div className="card">
                <div className="card-header">
                  <h2>💰 Your Active Loans</h2>
                  <p className="subtitle">Monitor your lent loans and track repayments</p>
                </div>
                <div className="card-body">
                  {activeLoans.data && activeLoans.data.length > 0 ? (
                    <div className="loans-grid">
                      {activeLoans.data.map((loan: any) => (
                        <div key={loan.id} className="loan-card-modern">
                          <div className="loan-card-header">
                            <div className="loan-id-section">
                              <div className="loan-id-icon">📄</div>
                              <div className="loan-id-info">
                                <div className="loan-id">#{loan.id}</div>
                                <div className="loan-date">Started {formatDate(loan.createdAt)}</div>
                              </div>
                            </div>
                            <span className={`status-badge-modern status-${loan.status.toLowerCase().replace(' ', '-')}`}>
                              {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                            </span>
                          </div>

                          <div className="loan-borrower-info">
                            <div className="borrower-avatar-modern">
                              {loan.borrowerName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                            </div>
                            <div className="borrower-details-modern">
                              <div className="borrower-name">{loan.borrowerName}</div>
                              <div className="borrower-college">{loan.borrowerCollege} • Year {loan.borrowerYear}</div>
                            </div>
                          </div>

                          <div className="loan-stats-grid">
                             <div className="stat-box">
                               <div className="stat-icon">💵</div>
                               <div className="stat-content">
                                 <div className="stat-label">Loan Amount</div>
                                 <div className="stat-value">₹{loan.amount.toLocaleString()}</div>
                               </div>
                             </div>
                             <div className="stat-box">
                               <div className="stat-icon">💰</div>
                               <div className="stat-content">
                                 <div className="stat-label">Total Due</div>
                                 <div className="stat-value">₹{loan.totalDueAmount?.toLocaleString()}</div>
                               </div>
                             </div>
                             <div className="stat-box">
                               <div className="stat-icon">📉</div>
                               <div className="stat-content">
                                 <div className="stat-label">Remaining</div>
                                 <div className="stat-value">₹{loan.remaining.toLocaleString()}</div>
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
                                <div className="stat-value highlight">₹{loan.dueAmount.toLocaleString()}</div>
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

                          <div className="loan-details-grid">
                            <div className="detail-item-modern">
                              <span className="detail-icon">📈</span>
                              <div className="detail-content">
                                <span className="detail-label-modern">Interest Rate</span>
                                <span className="detail-value-modern">{loan.interestRate}%</span>
                              </div>
                            </div>
                            <div className="detail-item-modern">
                              <span className="detail-icon">⏰</span>
                              <div className="detail-content">
                                <span className="detail-label-modern">Duration</span>
                                <span className="detail-value-modern">{loan.duration} days</span>
                              </div>
                            </div>
                            <div className="detail-item-modern">
                              <span className="detail-icon">💎</span>
                              <div className="detail-content">
                                <span className="detail-label-modern">Earnings</span>
                                <span className="detail-value-modern earnings">₹{loan.earnings.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state-modern">
                      <div className="empty-icon">💰</div>
                      <h3>No Active Loans</h3>
                      <p>You haven't funded any loans yet. Browse available borrowers to start lending!</p>
                      <button className="btn btn-primary" onClick={() => showPage("lending")}>
                        Browse Borrowers
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
         </section>

         {/* Gamification Section */}
        <section id="gamificationPage" className="page-section">
          <div className="section-header">
            <h2>Your Financial Journey 🎮</h2>
            <p>Track your progress and unlock achievements</p>
          </div>

          <div className="gamification-section">
            <div className="level-display">
              <div className="level-badge">🥈</div>
              <div className="level-info">
                <h3 id="levelTitle">Silver Lender</h3>
                 <p>You&apos;re in the top 30% of all lenders!</p>
              </div>
            </div>

            <div className="xp-progress">
              <div className="xp-label">
                <span>Experience Points</span>
                <span>
                  <strong id="currentXP">650</strong> / {lenderData.levelXP} XP
                </span>
              </div>
              <div className="progress-bar" style={{ height: "20px" }}>
                <div
                  className="progress-fill"
                  id="xpProgress"
                  style={{ width: "81.25%" }}
                ></div>
              </div>
            </div>

            <h4 style={{ marginBottom: "15px" }}>
              Current Streak:{" "}
              <span style={{ color: "var(--gold-elite)" }} id="currentStreak">
                7
              </span>{" "}
              🔥
            </h4>
            <p
              style={{
                color: "var(--silver-medium)",
                marginBottom: "30px",
                fontSize: "14px",
              }}
            >
              7 consecutive loans funded on-time. Keep it up!
            </p>

            <h4 style={{ marginBottom: "15px" }}>Your Badges</h4>
            <div className="badges-grid" id="badgesContainer">
              {[
                { name: "First Loan", icon: "🎯", unlocked: true },
                { name: "Trusted Lender", icon: "⭐", unlocked: true },
                { name: "Risk Manager", icon: "🛡️", unlocked: true },
                { name: "Community Helper", icon: "🤝", unlocked: false },
                { name: "Gold Standard", icon: "🥇", unlocked: false },
                { name: "Mentor", icon: "👨‍🏫", unlocked: false },
              ].map((badge, index) => (
                <div
                  key={index}
                  className={`badge-item ${badge.unlocked ? "unlocked" : "locked"}`}
                >
                  <div className="badge-icon">{badge.icon}</div>
                  <div className="badge-name">{badge.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lending Hub Section */}
        <section id="lendingPage" className="page-section">
          <div className="section-header">
            <h2>Available Borrowers 💰</h2>
            <p>Find the perfect match for your lending preferences</p>
          </div>

          <div className="filters-bar">
            <div className="filter-item">
              <label>Risk Level</label>
              <select
                id="riskFilter"
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
              >
                <option value="all">All Risks</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>
            <div className="filter-item">
              <label>Loan Amount</label>
              <select
                id="amountFilter"
                value={amountFilter}
                onChange={(e) => setAmountFilter(e.target.value)}
              >
                <option value="all">All Amounts</option>
                <option value="200-300">₹200 - ₹300</option>
                <option value="300-600">₹300 - ₹600</option>
                <option value="600-1000">₹600 - ₹1000</option>
              </select>
            </div>
            <div className="filter-item">
              <label>Duration</label>
              <select
                id="durationFilter"
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
              >
                <option value="all">All Durations</option>
                <option value="7">7 Days</option>
                <option value="14">14 Days</option>
                <option value="21">21 Days</option>
                <option value="30">30 Days</option>
              </select>
            </div>
            <div className="filter-item">
              <label>College Match</label>
              <select
                id="collegeFilter"
                value={collegeFilter}
                onChange={(e) => setCollegeFilter(e.target.value)}
              >
                <option value="all">All Colleges</option>
                <option value="same">Same College</option>
              </select>
            </div>
          </div>

          <div className="borrowers-grid" id="borrowersContainer">
            {filteredLoanRequests.data?.map((loanRequest: any) => (
              <div key={loanRequest.id} className="borrower-card">
                <div className="borrower-header">
                  <div className="borrower-avatar">{loanRequest.profileImage}</div>
                  <div className="borrower-info">
                    <h4>
                      {loanRequest.borrowerName}
                      {loanRequest.borrowerTrustBadge && (
                        <span className="verified-badge">✓ Verified</span>
                      )}
                    </h4>
                    <div className="borrower-meta">
                      {loanRequest.borrowerCollege} | Year {loanRequest.borrowerYear} CSE
                    </div>
                  </div>
                </div>
                <div className="borrower-score">
                  <div className="score-badge">
                    {loanRequest.matchPercentage}% Match
                  </div>
                  <div
                    className={`risk-badge risk-${loanRequest.riskTolerance.toLowerCase()}`}
                  >
                    {loanRequest.riskTolerance} Risk
                  </div>
                </div>
                <div className="borrower-details">
                  <div className="detail-item">
                    <span className="detail-label">Amount</span>
                    <span className="detail-value">₹{loanRequest.amount}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Duration</span>
                    <span className="detail-value">{loanRequest.duration} Days</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Interest</span>
                    <span className="detail-value">{loanRequest.interestRate}</span>
                  </div>
                </div>
                <div className="borrower-actions">
                  <button
                    className="btn btn-small"
                    onClick={() => console.log("View details for", loanRequest.id)}
                  >
                    View Details
                  </button>
                   <button
                     className="btn btn-primary btn-small btn-fund"
                     onClick={() => fundLoanMutation.mutate({ loanId: loanRequest.id })}
                   >
                     Fund Loan
                   </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Active Loans Section */}
        <section id="loansPage" className="page-section">
          <div className="section-header">
            <h2>Your Active Loans 📊</h2>
            <p>Track repayments and manage your lending portfolio</p>
          </div>

          {activeLoans.data && activeLoans.data.length > 0 ? (
            <div className="loans-grid">
              {activeLoans.data.map((loan: any) => (
                <div key={loan.id} className="loan-card-modern">
                  <div className="loan-card-header">
                    <div className="loan-id-section">
                      <div className="loan-id-icon">📄</div>
                      <div className="loan-id-info">
                        <div className="loan-id">#{loan.id}</div>
                        <div className="loan-date">Started {formatDate(loan.createdAt)}</div>
                      </div>
                    </div>
                    <span className={`status-badge-modern status-${loan.status.toLowerCase().replace(' ', '-')}`}>
                      {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                    </span>
                  </div>

                  <div className="loan-borrower-info">
                    <div className="borrower-avatar-modern">
                      {loan.borrowerName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="borrower-details-modern">
                      <div className="borrower-name">{loan.borrowerName}</div>
                      <div className="borrower-college">{loan.borrowerCollege} • Year {loan.borrowerYear}</div>
                    </div>
                  </div>

                  <div className="loan-stats-grid">
                    <div className="stat-box">
                      <div className="stat-icon">💵</div>
                      <div className="stat-content">
                        <div className="stat-label">Loan Amount</div>
                        <div className="stat-value">₹{loan.amount.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-icon">📉</div>
                      <div className="stat-content">
                        <div className="stat-label">Remaining</div>
                        <div className="stat-value">₹{loan.remaining.toLocaleString()}</div>
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
                        <div className="stat-value highlight">₹{loan.dueAmount.toLocaleString()}</div>
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

                  <div className="loan-details-grid">
                    <div className="detail-item-modern">
                      <span className="detail-icon">📈</span>
                      <div className="detail-content">
                        <span className="detail-label-modern">Interest Rate</span>
                        <span className="detail-value-modern">{loan.interestRate}%</span>
                      </div>
                    </div>
                    <div className="detail-item-modern">
                      <span className="detail-icon">⏰</span>
                      <div className="detail-content">
                        <span className="detail-label-modern">Duration</span>
                        <span className="detail-value-modern">{loan.duration} days</span>
                      </div>
                    </div>
                    <div className="detail-item-modern">
                      <span className="detail-icon">💎</span>
                      <div className="detail-content">
                        <span className="detail-label-modern">Earnings</span>
                        <span className="detail-value-modern earnings">₹{loan.earnings.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="loan-actions">
                    <button
                      className="btn btn-primary btn-small"
                      onClick={() => {
                        // For lenders, this could be a "Remind Borrower" or "View Payment History" action
                        alert(`Payment reminder sent to ${loan.borrowerName} for loan #${loan.id}`);
                      }}
                    >
                      📢 Remind Payment
                    </button>
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => {
                        // Could open a modal with payment details or history
                        alert(`Viewing payment history for loan #${loan.id}`);
                      }}
                    >
                      📋 Payment History
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state-modern">
              <div className="empty-icon">💰</div>
              <h3>No Active Loans</h3>
              <p>You haven't funded any loans yet. Browse available borrowers to start lending!</p>
              <button className="btn btn-primary" onClick={() => showPage("lending")}>
                Browse Borrowers
              </button>
            </div>
          )}
        </section>

        {/* Wallet Section */}
        <section id="walletPage" className="page-section">
          <div className="section-header">
            <h2>Your Wallet 💳</h2>
            <p>Manage your funds and view transaction history</p>
          </div>

          <div className="stats-grid" style={{ marginBottom: "30px" }}>
            <div className="stat-card">
              <div className="stat-label">Available Balance</div>
               <div className="stat-value" id="walletAvailable">
                 ₹{currentBalance || lenderData.walletBalance}
               </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">In Active Loans</div>
              <div className="stat-value" id="walletLocked">
                ₹3,200
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">This Month Earnings</div>
              <div className="stat-value amount-positive" id="monthEarnings">
                {lenderData.monthlyEarnings}
              </div>
            </div>
          </div>

          <h3 style={{ marginBottom: "20px" }}>Recent Transactions</h3>
          <div id="transactionsContainer">
            {transactions.data?.map((transaction: any, index: number) => (
              <div key={index} className="transaction-item">
                <div className="transaction-info">
                  <div className="transaction-type">{transaction.type}</div>
                  <div className="transaction-date">{transaction.date}</div>
                </div>
                 <div
                   className={`transaction-amount ${transaction.positive ? "amount-positive" : "amount-negative"}`}
                 >
                   {transaction.positive ? '+' : '-'}₹{transaction.amount}
                 </div>
              </div>
            ))}
          </div>
        </section>

        {/* Profile Section */}
        <section id="profilePage" className="page-section">
          <div className="section-header">
            <h2>Your Profile ⚙️</h2>
            <p>Manage your account and preferences</p>
          </div>

          <div className="profile-section">
            <div className="profile-header">
              <div className="profile-avatar" id="profileAvatar">
                👨‍💼
              </div>
              <div>
                <h3 id="profileName">{lenderData.name}</h3>
                <p
                  style={{ color: "var(--silver-medium)", margin: "5px 0" }}
                  id="profileEmail"
                >
                  {lenderData.email}
                </p>
                <span className="verified-badge" id="verifiedBadge">
                  ✓ Verified
                </span>
              </div>
            </div>

            <div className="profile-details">
              <div className="detail-card">
                <div className="detail-label">College</div>
                <div className="detail-value" id="profileCollege">
                  {lenderData.college}
                </div>
              </div>
              <div className="detail-card">
                <div className="detail-label">Year &amp; Branch</div>
                <div className="detail-value" id="profileYear">
                  {lenderData.year}
                </div>
              </div>
              <div className="detail-card">
                <div className="detail-label">Trust Score</div>
                <div className="detail-value" id="profileTrust">
                  {lenderData.trustScore}
                </div>
              </div>
              <div className="detail-card">
                <div className="detail-label">Risk Tolerance</div>
                <div className="detail-value" id="profileRisk">
                  {lenderData.riskTolerance}
                </div>
              </div>
              <div className="detail-card">
                <div className="detail-label">Member Since</div>
                <div className="detail-value" id="profileSince">
                  {lenderData.memberSince}
                </div>
              </div>
              <div className="detail-card">
                <div className="detail-label">Default Rate</div>
                <div className="detail-value" id="profileDefault">
                  {lenderData.defaultRate}
                </div>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3 style={{ marginBottom: "15px" }}>Preferences</h3>
            <div className="form-group">
              <label>Anonymous Lending Mode</label>
              <select className="form-control">
                <option>Enabled</option>
                <option>Disabled</option>
              </select>
            </div>
            <div className="form-group">
              <label>Risk Tolerance</label>
              <select className="form-control">
                <option>Conservative</option>
                <option selected>Moderate</option>
                <option>Aggressive</option>
              </select>
            </div>
             <button className="btn btn-primary">Save Preferences</button>
           </div>

           <div className="profile-section">
             <h3 style={{ marginBottom: "15px" }}>Lending Advertisement</h3>
             <p style={{ color: "var(--silver-medium)", marginBottom: "15px", fontSize: "14px" }}>
               Create advertisements to attract borrowers and showcase your lending terms
             </p>
             <button
               className="btn btn-primary"
               onClick={() => setShowAdModal(true)}
             >
               Create Advertisement
             </button>
           </div>
         </section>
      </div>

      {/* Balance Modal */}
      {showBalanceModal && (
        <div className="modal active" onClick={() => setShowBalanceModal(false)}>
          <div className="modal-content balance-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-close" onClick={() => setShowBalanceModal(false)}>×</div>
            <div className="modal-header">
              <div className="balance-header-icon">💰</div>
              <h3>Your Financial Overview</h3>
              <p>Track your lending portfolio and earnings</p>
            </div>
            <div className="balance-details">
              <div className="balance-item primary">
                <div className="balance-icon">🏦</div>
                <div className="balance-info">
                  <span className="balance-label">Available Balance</span>
                   <span className="balance-value">₹{currentBalance || lenderData.walletBalance}</span>
                  <span className="balance-subtitle">Ready to lend</span>
                </div>
              </div>
              <div className="balance-item">
                <div className="balance-icon">📈</div>
                <div className="balance-info">
                  <span className="balance-label">Total Lent</span>
                  <span className="balance-value">₹{lenderData.totalLent}</span>
                  <span className="balance-subtitle">Lifetime lending</span>
                </div>
              </div>
              <div className="balance-item earnings">
                <div className="balance-icon">💎</div>
                <div className="balance-info">
                  <span className="balance-label">Monthly Earnings</span>
                  <span className="balance-value">₹{lenderData.monthlyEarnings}</span>
                  <span className="balance-subtitle">From interest</span>
                </div>
              </div>
            </div>
            <div className="balance-actions">
               <button className="btn btn-secondary" onClick={() => setShowAddFundsModal(true)}>Add Funds</button>
              <button className="btn btn-primary">View Transactions</button>
            </div>
          </div>
        </div>
      )}

      {/* Advertisement Modal */}
      <AdvertisementModal
        isOpen={showAdModal}
        onClose={() => setShowAdModal(false)}
        onSuccess={() => {
          // Could refetch advertisements or show success message
          setShowAdModal(false);
        }}
      />

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
