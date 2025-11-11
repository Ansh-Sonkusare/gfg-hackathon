import { router, publicProcedure, protectedProcedure, ee } from '../trpc';
import { observable } from '@trpc/server/observable';
import { LoanUpdate, BalanceUpdate } from '../types';
import { prisma } from '../types';

export const lenderRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({ where: { id: ctx.userId } });
    if (!user) throw new Error('User not found');

    // Calculate total lent
    const totalLentResult = await prisma.loan.aggregate({
      where: { lenderId: ctx.userId },
      _sum: { amount: true }
    });
    const totalLent = totalLentResult._sum.amount || 0;

    // Calculate active loans count
    const activeLoansCount = await prisma.loan.count({
      where: { lenderId: ctx.userId, status: { not: 'completed' } }
    });

    // Calculate monthly earnings (sum of positive transactions in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const monthlyEarningsResult = await prisma.transaction.aggregate({
      where: {
        userId: ctx.userId,
        positive: true,
        date: { gte: thirtyDaysAgo }
      },
      _sum: { amount: true }
    });
    const monthlyEarnings = monthlyEarningsResult._sum.amount || 0;

    return {
      name: user.name,
      email: user.email,
      college: user.collegeName,
      year: `${user.collegeYear}rd Year`,
      trustScore: `${user.creditScore}/1000`,
      riskTolerance: user.riskTolerance,
      defaultRate: "0%", // No defaults in DB yet
      memberSince: "Jan 2025",
      walletBalance: user.currentBalance,
      totalLent: totalLent.toString(),
      activeLoans: activeLoansCount,
      defaultRatePercent: "0%",
      monthlyEarnings: `₹${monthlyEarnings}`,
      currentLevel: user.reputation === 'Excellent' ? "Gold 🥇" : user.reputation === 'Good' ? "Silver 🥈" : "Bronze 🥉",
      levelProgress: user.creditScore % 100,
      levelXP: user.creditScore,
    };
  }),

  getLoanRequests: protectedProcedure.query(async ({ ctx }) => {
    const loans = await prisma.loan.findMany({
      where: {
        status: 'pending',
        borrowerId: { not: ctx.userId } // Exclude loans from current user
      },
      include: { borrower: true }
    });
    return loans.map(loan => ({
      id: loan.id,
      borrowerId: loan.borrowerId,
      borrowerName: loan.borrower?.name || 'Unknown',
      borrowerCollege: loan.borrower?.collegeName || 'Unknown',
      borrowerYear: loan.borrower?.collegeYear || 1,
      borrowerCreditScore: loan.borrower?.creditScore || 0,
      borrowerTrustBadge: loan.borrower?.trustBadge || false,
      amount: loan.amount,
      duration: Math.round(loan.amount / loan.dueAmount), // Approximate
      interestRate: "8%", // Fixed
      riskTolerance: loan.borrower?.riskTolerance || 'Medium',
      matchPercentage: Math.min(100, (loan.borrower?.creditScore || 0) / 10),
      profileImage: loan.borrower?.name.split(' ').map(n => n[0]).join('') || '',
    }));
  }),

  getActiveLoans: protectedProcedure.query(async ({ ctx }) => {
    const loans = await prisma.loan.findMany({
      where: { lenderId: ctx.userId },
      include: { borrower: true }
    });
    return loans.map(loan => ({
      id: loan.id,
      borrower: loan.borrower?.name || 'Unknown',
      amount: loan.amount,
      interest: loan.interestRate,
      dueDate: loan.nextDueDate.toISOString().split('T')[0],
      status: loan.status,
      earnings: Math.round(loan.amount * loan.interestRate / 100)
    }));
  }),

  updateFilters: protectedProcedure
    .input((val: unknown) => {
      if (typeof val === 'object' && val !== null) {
        return val as {
          riskFilter: string;
          amountFilter: string;
          durationFilter: string;
          collegeFilter: string;
        };
      }
      throw new Error('Invalid input');
    })
    .query(async ({ input, ctx }) => {
      const loans = await prisma.loan.findMany({
        where: {
          status: 'pending',
          borrowerId: { not: ctx.userId } // Exclude loans from current user
        },
        include: { borrower: true }
      });

      let filteredLoans = loans.map(loan => {
        return {
          id: loan.id,
          borrowerId: loan.borrowerId,
          borrowerName: loan.borrower?.name || 'Unknown',
          borrowerCollege: loan.borrower?.collegeName || 'Unknown',
          borrowerYear: loan.borrower?.collegeYear || 1,
          borrowerCreditScore: loan.borrower?.creditScore || 0,
          borrowerTrustBadge: loan.borrower?.trustBadge || false,
          amount: loan.amount,
          duration: Math.round(loan.amount / loan.dueAmount),
          interestRate: "8%",
          riskTolerance: loan.borrower?.riskTolerance || 'Medium',
          matchPercentage: Math.min(100, (loan.borrower?.creditScore || 0) / 10),
          profileImage: loan.borrower?.name.split(' ').map(n => n[0]).join('') || '',
        };
      });

      // Apply filters
      if (input.riskFilter !== 'all') {
        filteredLoans = filteredLoans.filter(l => l.riskTolerance === input.riskFilter);
      }
      if (input.amountFilter !== 'all') {
        const [min, max] = input.amountFilter.split('-').map(Number);
        filteredLoans = filteredLoans.filter(l => l.amount >= min && l.amount <= max);
      }
      if (input.durationFilter !== 'all') {
        const duration = Number(input.durationFilter);
        filteredLoans = filteredLoans.filter(l => l.duration === duration);
      }
      if (input.collegeFilter !== 'all') {
        filteredLoans = filteredLoans.filter(l => l.borrowerCollege === input.collegeFilter);
      }

      return filteredLoans;
    }),

  getTransactions: protectedProcedure.query(async ({ ctx }) => {
    const txns = await prisma.transaction.findMany({
      where: { userId: ctx.userId },
      orderBy: { date: 'desc' }
    });
    return txns.map(txn => ({
      type: txn.type,
      amount: txn.amount,
      date: txn.date.toISOString().split('T')[0],
      positive: txn.positive,
    }));
  }),

  addFunds: protectedProcedure
    .input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'amount' in val) {
        return val as { amount: number };
      }
      throw new Error('Invalid input');
    })
    .mutation(async ({ input, ctx }) => {
      // Create transaction for adding funds
      await prisma.transaction.create({
        data: {
          userId: ctx.userId,
          type: 'Wallet Recharge',
          amount: input.amount,
          positive: true
        }
      });

      // Update user balance
      const updatedUser = await prisma.user.update({
        where: { id: ctx.userId },
        data: { currentBalance: { increment: input.amount } }
      });

      // Emit balance update
      ee.emit('balanceUpdate', {
        userId: ctx.userId,
        type: 'balanceUpdate',
        newBalance: updatedUser.currentBalance
      });

      return { success: true, message: `Added ₹${input.amount} to your wallet` };
    }),

  fundLoan: protectedProcedure
    .input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'loanId' in val) {
        return val as { loanId: number };
      }
      throw new Error('Invalid input');
    })
    .mutation(async ({ input, ctx }) => {
      const loan = await prisma.loan.findUnique({
        where: { id: input.loanId },
        include: { borrower: true }
      });
      if (!loan) throw new Error('Loan not found');
      if (loan.status !== 'pending') throw new Error('Loan is not pending');

      // Check if lender has sufficient balance
      const lender = await prisma.user.findUnique({ where: { id: ctx.userId } });
      if (!lender || lender.currentBalance < loan.amount) {
        throw new Error('Insufficient balance');
      }

      // Update loan status
      await prisma.loan.update({
        where: { id: input.loanId },
        data: { status: 'active', lenderId: ctx.userId }
      });

      // Create transactions
      await prisma.transaction.create({
        data: {
          userId: loan.borrowerId,
          type: 'Loan Received',
          amount: loan.amount,
          positive: true
        }
      });
      await prisma.transaction.create({
        data: {
          userId: ctx.userId,
          type: 'Loan Funded',
          amount: loan.amount,
          positive: false
        }
      });

      // Update balances
      const updatedBorrower = await prisma.user.update({
        where: { id: loan.borrowerId },
        data: { currentBalance: { increment: loan.amount } }
      });
      const updatedLender = await prisma.user.update({
        where: { id: ctx.userId },
        data: { currentBalance: { decrement: loan.amount } }
      });

      // Emit balance update for lender
      ee.emit('balanceUpdate', {
        userId: ctx.userId,
        type: 'balanceUpdate',
        newBalance: updatedLender.currentBalance
      });

      // Emit balance update for borrower
      ee.emit('balanceUpdate', {
        userId: loan.borrowerId,
        type: 'balanceUpdate',
        newBalance: updatedBorrower.currentBalance
      });

      // Emit loan update for borrower
      ee.emit('loanUpdate', {
        userId: loan.borrowerId,
        type: 'funded',
        loanId: loan.id
      });

      // Emit loan update for lender
      ee.emit('loanUpdate', {
        userId: ctx.userId,
        type: 'funded',
        loanId: loan.id
      });

      return { success: true, message: `Loan funded for ${loan.borrower?.name}`, loanId: loan.id };
    }),



  // Subscription for loan updates
  onLoanUpdate: protectedProcedure.subscription(({ ctx }) => {
    return observable<LoanUpdate>((emit) => {
      const onUpdate = (data: LoanUpdate & { userId: number }) => {
        if (data.userId === ctx.userId) {
          emit.next(data);
        }
      };

      ee.on('loanUpdate', onUpdate);

      return () => {
        ee.off('loanUpdate', onUpdate);
      };
    });
  }),

  // Subscription for balance updates
  onBalanceUpdate: protectedProcedure.subscription(({ ctx }) => {
    return observable<BalanceUpdate>((emit) => {
      const onUpdate = (data: BalanceUpdate & { userId: number }) => {
        if (data.userId === ctx.userId) {
          emit.next(data);
        }
      };

      ee.on('balanceUpdate', onUpdate);

      return () => {
        ee.off('balanceUpdate', onUpdate);
      };
    });
  })
});
