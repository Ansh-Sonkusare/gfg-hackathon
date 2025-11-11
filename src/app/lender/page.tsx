"use client";

import { useEffect, useState } from "react";

// Data
const lenderData = {
  name: "Aditya",
  email: "aditya.kumar@siu.edu.in",
  college: "SIU Nagpur",
  year: "3rd Year CSE",
  trustScore: "750/1000",
  riskTolerance: "Moderate",
  defaultRate: "2.5%",
  memberSince: "Oct 2025",
  walletBalance: "₹5,200",
  totalLent: "₹12,400",
  activeLoans: 8,
  defaultRatePercent: "2.5%",
  monthlyEarnings: "₹540",
  currentLevel: "Silver 🥈",
  levelProgress: 150,
  levelXP: 800,
};

const lenders = [
  {
    id: 1,
    name: "Priya Patel",
    college: "SIU Nagpur",
    year: 3,
    branch: "Engineering",
    matchPercentage: 92,
    riskTolerance: "Medium",
    interestRate: "8%",
    trustBadge: true,
    profileImage: "PP",
    amount: 2000,
    duration: 14,
    compatibility: 85,
  },
  {
    id: 2,
    name: "Rahul Gupta",
    college: "SIU Nagpur",
    year: 3,
    branch: "CSE",
    matchPercentage: 88,
    riskTolerance: "Low",
    interestRate: "6%",
    trustBadge: true,
    profileImage: "RG",
    amount: 1500,
    duration: 21,
    compatibility: 78,
  },
];

const activeLoans = [
  {
    id: 1,
    borrower: "Ananya Sharma",
    amount: "₹5,000",
    interest: "7%",
    dueDate: "2025-11-15",
    status: "on-track",
    earnings: "₹350",
  },
  {
    id: 2,
    borrower: "Vikram Singh",
    amount: "₹3,000",
    interest: "6%",
    dueDate: "2025-11-20",
    status: "on-track",
    earnings: "₹180",
  },
];

const transactions = [
  {
    type: "Interest Earned",
    amount: "+₹540",
    date: "Nov 01, 2025",
    positive: true,
  },
  {
    type: "Loan Funded",
    amount: "-₹2,000",
    date: "Oct 28, 2025",
    positive: false,
  },
  {
    type: "Principal Returned",
    amount: "+₹1,500",
    date: "Oct 25, 2025",
    positive: true,
  },
];

export default function LenderDashboard() {
  const [currentPage, setCurrentPage] = useState("home");
  const [filteredLenders, setFilteredLenders] = useState(lenders);
  const [riskFilter, setRiskFilter] = useState("all");
  const [amountFilter, setAmountFilter] = useState("all");
  const [durationFilter, setDurationFilter] = useState("all");
  const [collegeFilter, setCollegeFilter] = useState("all");

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

  const renderLendingHub = () => {
    // Filter lenders based on criteria
    let filtered = lenders;

    if (riskFilter !== "all") {
      filtered = filtered.filter(
        (l) => l.riskTolerance.toLowerCase() === riskFilter,
      );
    }

    if (amountFilter !== "all") {
      const [min, max] = amountFilter.split("-").map((n) => parseInt(n));
      filtered = filtered.filter((l) => l.amount >= min && l.amount <= max);
    }

    if (durationFilter !== "all") {
      filtered = filtered.filter(
        (l) => l.duration === parseInt(durationFilter),
      );
    }

    setFilteredLenders(filtered);
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
        </div>
      </nav>

      <div className="container">
        {/* Home Section */}
        <section id="homePage" className="page-section active">
          <div className="section-header">
            <h2>
              Welcome back, <span id="userName">{lenderData.name}</span>! 👋
            </h2>
            <p>Here's your lending portfolio overview</p>
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
                {lenderData.walletBalance}
              </div>
              <div className="stat-change">Available to lend</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Lent</div>
              <div className="stat-value" id="totalLent">
                {lenderData.totalLent}
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
                <p>You're in the top 30% of all lenders!</p>
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
                onChange={(e) => {
                  setRiskFilter(e.target.value);
                  renderLendingHub();
                }}
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
                onChange={(e) => {
                  setAmountFilter(e.target.value);
                  renderLendingHub();
                }}
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
                onChange={(e) => {
                  setDurationFilter(e.target.value);
                  renderLendingHub();
                }}
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
            {filteredLenders.map((lender) => (
              <div key={lender.id} className="borrower-card">
                <div className="borrower-header">
                  <div className="borrower-avatar">{lender.profileImage}</div>
                  <div className="borrower-info">
                    <h4>
                      {lender.name}
                      {lender.trustBadge && (
                        <span className="verified-badge">✓ Verified</span>
                      )}
                    </h4>
                    <div className="borrower-meta">
                      {lender.college} | Year {lender.year} {lender.branch}
                    </div>
                  </div>
                </div>
                <div className="borrower-score">
                  <div className="score-badge">
                    {lender.matchPercentage}% Match
                  </div>
                  <div
                    className={`risk-badge risk-${lender.riskTolerance.toLowerCase()}`}
                  >
                    {lender.riskTolerance} Risk
                  </div>
                </div>
                <div className="borrower-details">
                  <div className="detail-item">
                    <span className="detail-label">Amount</span>
                    <span className="detail-value">₹{lender.amount}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Duration</span>
                    <span className="detail-value">{lender.duration} Days</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Interest</span>
                    <span className="detail-value">{lender.interestRate}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Compatibility</span>
                    <span className="detail-value">
                      {lender.compatibility}%
                    </span>
                  </div>
                </div>
                <div className="compatibility-bar">
                  <div className="compatibility-label">
                    <span>Compatibility</span>
                    <span>{lender.compatibility}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${lender.compatibility}%` }}
                    ></div>
                  </div>
                </div>
                <div className="borrower-actions">
                  <button
                    className="btn btn-small"
                    onClick={() => console.log("View details for", lender.id)}
                  >
                    View Details
                  </button>
                  <button
                    className="btn btn-primary btn-small"
                    onClick={() => console.log("Fund loan for", lender.id)}
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

          <div className="loans-table">
            <div className="table-header">
              <div>Borrower</div>
              <div>Amount</div>
              <div>Interest</div>
              <div>Due Date</div>
              <div>Status</div>
              <div>Earnings</div>
            </div>
            <div id="loansContainer">
              {activeLoans.map((loan) => (
                <div key={loan.id} className="table-row">
                  <div>{loan.borrower}</div>
                  <div>{loan.amount}</div>
                  <div>{loan.interest}</div>
                  <div>{formatDate(loan.dueDate)}</div>
                  <div>
                    <span className={`status-badge status-${loan.status}`}>
                      {loan.status.replace("-", " ")}
                    </span>
                  </div>
                  <div className="amount-positive">{loan.earnings}</div>
                </div>
              ))}
            </div>
          </div>
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
                {lenderData.walletBalance}
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
            {transactions.map((transaction, index) => (
              <div key={index} className="transaction-item">
                <div className="transaction-info">
                  <div className="transaction-type">{transaction.type}</div>
                  <div className="transaction-date">{transaction.date}</div>
                </div>
                <div
                  className={`transaction-amount ${transaction.positive ? "amount-positive" : "amount-negative"}`}
                >
                  {transaction.amount}
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
        </section>
      </div>

      <style jsx>{`
        :root {
          --black-deep: #000000;
          --black-charcoal: #0a0a0a;
          --grey-900: #1a1a1a;
          --grey-800: #2a2a2a;
          --grey-700: #3a3a3a;
          --grey-600: #4a4a4a;
          --silver-light: #e8e8e8;
          --silver-medium: #d3d3d3;
          --silver-dark: #c0c0c0;
          --white-pure: #ffffff;
          --gold-elite: #ffd700;
          --bronze-fair: #cd7f32;
          --red-critical: #ff6b6b;
          --green-success: #4caf50;
          --blue-info: #2196f3;
          --gradient-metallic: linear-gradient(
            135deg,
            #c0c0c0 0%,
            #e8e8e8 50%,
            #c0c0c0 100%
          );
        }

        body {
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          background: var(--black-deep);
          color: var(--white-pure);
          line-height: 1.6;
          overflow-x: hidden;
        }

        /* Top Navigation */
        .top-nav {
          background: var(--grey-900);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 16px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(10px);
        }

        .nav-brand {
          font-size: 24px;
          font-weight: 700;
          background: var(--gradient-metallic);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-menu {
          display: flex;
          gap: 30px;
          list-style: none;
        }

        .nav-menu a {
          color: var(--silver-medium);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .nav-menu a:hover,
        .nav-menu a.active {
          color: var(--white-pure);
        }

        .nav-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--grey-800);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          border: 2px solid var(--silver-dark);
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 40px;
        }

        .page-section {
          display: none;
        }

        .page-section.active {
          display: block;
        }

        .section-header {
          margin-bottom: 30px;
        }

        .section-header h2 {
          font-size: 28px;
          margin-bottom: 8px;
        }

        .section-header p {
          color: var(--silver-medium);
          font-size: 14px;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: var(--grey-900);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .stat-label {
          color: var(--silver-medium);
          font-size: 13px;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .stat-change {
          font-size: 12px;
          color: var(--green-success);
        }

        /* EduCIBIL Score Display */
        .educibil-card {
          background: linear-gradient(
            135deg,
            var(--grey-900) 0%,
            var(--grey-800) 100%
          );
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 40px;
        }

        .educibil-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .educibil-score {
          font-size: 64px;
          font-weight: 700;
        }

        .educibil-score.gold {
          color: var(--gold-elite);
        }

        .educibil-score.silver {
          color: var(--silver-dark);
        }

        .educibil-score.bronze {
          color: var(--bronze-fair);
        }

        .educibil-score.critical {
          color: var(--red-critical);
        }

        .score-breakdown {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .score-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .score-item-label {
          color: var(--silver-medium);
          font-size: 13px;
        }

        .score-item-value {
          font-size: 20px;
          font-weight: 600;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: var(--grey-800);
          border-radius: 10px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--gradient-metallic);
          transition: width 0.3s ease;
        }

        /* Badges and Gamification */
        .gamification-section {
          background: var(--grey-900);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 40px;
        }

        .level-display {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
        }

        .level-badge {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          border: 3px solid var(--silver-dark);
          background: var(--grey-800);
        }

        .level-info h3 {
          font-size: 24px;
          margin-bottom: 5px;
        }

        .level-info p {
          color: var(--silver-medium);
          font-size: 14px;
        }

        .xp-progress {
          margin-bottom: 30px;
        }

        .xp-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 14px;
          color: var(--silver-medium);
        }

        .badges-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 15px;
        }

        .badge-item {
          background: var(--grey-800);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .badge-item.unlocked {
          border-color: var(--gold-elite);
        }

        .badge-item.locked {
          opacity: 0.4;
        }

        .badge-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .badge-name {
          font-size: 12px;
          font-weight: 600;
        }

        /* Borrower Cards */
        .filters-bar {
          background: var(--grey-900);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 30px;
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .filter-item {
          flex: 1;
          min-width: 150px;
        }

        .filter-item label {
          display: block;
          color: var(--silver-medium);
          font-size: 12px;
          margin-bottom: 5px;
          text-transform: uppercase;
        }

        .filter-item select,
        .filter-item input {
          width: 100%;
          padding: 10px;
          background: var(--grey-800);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: var(--white-pure);
          font-size: 14px;
        }

        .borrowers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .borrower-card {
          background: var(--grey-900);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .borrower-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          border-color: var(--silver-dark);
        }

        .borrower-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .borrower-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: var(--grey-800);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          border: 2px solid rgba(255, 255, 255, 0.1);
        }

        .borrower-info h4 {
          font-size: 18px;
          margin-bottom: 4px;
        }

        .borrower-meta {
          font-size: 12px;
          color: var(--silver-medium);
        }

        .borrower-score {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
          padding: 10px;
          background: var(--grey-800);
          border-radius: 8px;
        }

        .score-badge {
          font-size: 24px;
          font-weight: 700;
        }

        .risk-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .risk-low {
          background: rgba(76, 175, 80, 0.2);
          color: var(--green-success);
        }

        .risk-medium {
          background: rgba(255, 193, 7, 0.2);
          color: #ffc107;
        }

        .risk-high {
          background: rgba(255, 107, 107, 0.2);
          color: var(--red-critical);
        }

        .borrower-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 15px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
        }

        .detail-label {
          font-size: 11px;
          color: var(--silver-medium);
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .detail-value {
          font-size: 16px;
          font-weight: 600;
        }

        .compatibility-bar {
          margin-bottom: 15px;
        }

        .compatibility-label {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--silver-medium);
          margin-bottom: 5px;
        }

        .borrower-actions {
          display: flex;
          gap: 10px;
        }

        .btn-small {
          padding: 8px 16px;
          font-size: 13px;
          flex: 1;
        }

        /* Modal */
        .modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(5px);
          z-index: 1000;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal.active {
          display: flex;
        }

        .modal-content {
          background: var(--grey-900);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 30px;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }

        .modal-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: var(--grey-800);
          border: none;
          color: var(--white-pure);
          font-size: 24px;
          width: 35px;
          height: 35px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-header {
          margin-bottom: 20px;
        }

        .modal-header h3 {
          font-size: 24px;
          margin-bottom: 5px;
        }

        /* Active Loans Table */
        .loans-table {
          background: var(--grey-900);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          overflow: hidden;
        }

        .table-header {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
          gap: 10px;
          padding: 15px 20px;
          background: var(--grey-800);
          font-size: 12px;
          font-weight: 600;
          color: var(--silver-medium);
          text-transform: uppercase;
        }

        .table-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
          gap: 10px;
          padding: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
        }

        .table-row:hover {
          background: var(--grey-800);
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          display: inline-block;
        }

        .status-on-track {
          background: rgba(76, 175, 80, 0.2);
          color: var(--green-success);
        }

        .status-at-risk {
          background: rgba(255, 193, 7, 0.2);
          color: #ffc107;
        }

        .status-overdue {
          background: rgba(255, 107, 107, 0.2);
          color: var(--red-critical);
        }

        /* Transactions */
        .transaction-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: var(--grey-800);
          border-radius: 10px;
          margin-bottom: 10px;
        }

        .transaction-info {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .transaction-type {
          font-size: 14px;
          font-weight: 600;
        }

        .transaction-date {
          font-size: 12px;
          color: var(--silver-medium);
        }

        .transaction-amount {
          font-size: 18px;
          font-weight: 700;
        }

        .amount-positive {
          color: var(--green-success);
        }

        .amount-negative {
          color: var(--red-critical);
        }

        /* Toast Notification */
        .toast {
          position: fixed;
          bottom: 30px;
          right: 30px;
          background: var(--grey-900);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 16px 24px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          display: none;
          align-items: center;
          gap: 12px;
          z-index: 2000;
        }

        .toast.active {
          display: flex;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .toast-icon {
          font-size: 24px;
        }

        .toast-message {
          font-size: 14px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .top-nav {
            padding: 16px 20px;
          }

          .nav-menu {
            display: none;
          }

          .container {
            padding: 20px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .borrowers-grid {
            grid-template-columns: 1fr;
          }

          .table-header,
          .table-row {
            display: none;
          }

          .filters-bar {
            flex-direction: column;
          }
        }

        .verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(76, 175, 80, 0.2);
          color: var(--green-success);
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .loan-preview {
          background: var(--grey-800);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          margin-top: 20px;
        }

        .preview-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .preview-item:last-child {
          border-bottom: none;
        }

        .profile-section {
          background: var(--grey-900);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 30px;
          margin-bottom: 20px;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
        }

        .profile-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--grey-800);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          border: 3px solid var(--silver-dark);
        }

        .profile-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .detail-card {
          background: var(--grey-800);
          padding: 15px;
          border-radius: 10px;
        }

        .reviews-section {
          margin-top: 30px;
        }

        .review-item {
          background: var(--grey-800);
          padding: 15px;
          border-radius: 10px;
          margin-bottom: 10px;
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .review-rating {
          color: var(--gold-elite);
        }

        /* Buttons */
        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .btn-primary {
          width: 100%;
          background: var(--gradient-metallic);
          color: var(--black-deep);
          box-shadow: 0 4px 15px rgba(192, 192, 192, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(192, 192, 192, 0.4);
        }

        .btn-secondary {
          background: var(--grey-800);
          color: var(--white-pure);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn-secondary:hover {
          background: var(--grey-700);
        }

        /* Form elements */
        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          color: var(--silver-light);
          font-size: 14px;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 12px 16px;
          background: var(--grey-800);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: var(--white-pure);
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--silver-dark);
          box-shadow: 0 0 0 3px rgba(192, 192, 192, 0.1);
        }
      `}</style>
    </>
  );
}
