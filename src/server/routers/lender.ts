import { router, publicProcedure, ee } from '../trpc';
import { observable } from '@trpc/server/observable';
import { LoanUpdate } from '../types';
import { prisma } from '../types';

export const lenderRouter = router({
  getProfile: publicProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({ where: { id: ctx.userId } });
    if (!user) throw new Error('User not found');

    return {
      name: user.name,
      email: user.email,
      college: user.collegeName,
      year: `${user.collegeYear}rd Year CSE`, // Mock
      trustScore: `${user.creditScore}/1000`,
      riskTolerance: "Moderate", // Mock
      defaultRate: "2.5%",
      memberSince: "Oct 2025",
      walletBalance: `₹${user.currentBalance}`,
      totalLent: "₹12,400", // Mock
      activeLoans: 8, // Mock
      defaultRatePercent: "2.5%",
      monthlyEarnings: "₹540", // Mock
      currentLevel: "Silver 🥈",
      levelProgress: 150,
      levelXP: 800,
    };
  }),

  getBorrowers: publicProcedure.query(async () => {
    const borrowers = await prisma.user.findMany();
    return borrowers.map(borrower => ({
      id: borrower.id,
      name: borrower.name,
      collegeName: borrower.collegeName,
      collegeYear: borrower.collegeYear,
      branch: "CSE", // Mock
      matchPercentage: 85 + Math.floor(Math.random() * 15), // Mock
      riskTolerance: "Medium", // Mock
      interestRate: "8%", // Mock
      trustBadge: borrower.trustBadge,
      profileImage: borrower.name.split(' ').map(n => n[0]).join(''),
      amount: 2000, // Mock
      duration: 14, // Mock
      compatibility: 85, // Mock
    }));
  }),

  getActiveLoans: publicProcedure.query(async ({ ctx }) => {
    const loans = await prisma.loan.findMany({
      where: { lenderId: ctx.userId },
      include: { borrower: true }
    });
    return loans.map(loan => ({
      id: loan.id,
      borrower: loan.borrower?.name || 'Unknown',
      amount: `₹${loan.amount}`,
      interest: `${loan.interestRate}%`,
      dueDate: loan.nextDueDate.toISOString().split('T')[0],
      status: loan.status,
      earnings: `₹${Math.round(loan.amount * loan.interestRate / 100)}`
    }));
  }),

  getTransactions: publicProcedure.query(async ({ ctx }) => {
    const txns = await prisma.transaction.findMany({
      where: { userId: ctx.userId },
      orderBy: { date: 'desc' }
    });
    return txns.map(txn => ({
      type: txn.type,
      amount: `${txn.positive ? '+' : '-'}₹${txn.amount}`,
      date: txn.date.toISOString().split('T')[0],
      positive: txn.positive,
    }));
  }),

  fundLoan: publicProcedure
    .input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'borrowerId' in val && 'amount' in val) {
        return val as { borrowerId: number; amount: number };
      }
      throw new Error('Invalid input');
    })
    .mutation(async ({ input, ctx }) => {
      const borrower = await prisma.user.findUnique({ where: { id: input.borrowerId } });
      if (!borrower) throw new Error('Borrower not found');

      const loan = await prisma.loan.create({
        data: {
          borrowerId: input.borrowerId,
          lenderId: ctx.userId,
          amount: input.amount,
          remaining: input.amount,
          interestRate: 7, // Mock
          status: 'on-track',
          loanType: 'personal', // Default
          nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          progressPercent: 0,
          dueAmount: Math.round(input.amount / 12)
        }
      });

      // Emit event
      ee.emit('loanUpdate', {
        userId: input.borrowerId,
        type: 'funded' as const,
        loan: loan
      });

      return { success: true, message: `Loan funded for ${borrower.name}`, loanId: loan.id };
    }),

  updateFilters: publicProcedure
    .input((val: unknown) => {
      if (typeof val === 'object' && val !== null) {
        return val as {
          riskFilter?: string;
          amountFilter?: string;
          durationFilter?: string;
          collegeFilter?: string;
        };
      }
      throw new Error('Invalid input');
    })
    .query(async ({ input }) => {
      // Mock filtering - in real app, implement proper filters
      const borrowers = await prisma.user.findMany();

      return borrowers.map(borrower => ({
        id: borrower.id,
        name: borrower.name,
        college: borrower.collegeName,
        year: borrower.collegeYear,
        branch: "CSE",
        matchPercentage: 85 + Math.floor(Math.random() * 15),
        riskTolerance: "Medium",
        interestRate: "8%",
        trustBadge: borrower.trustBadge,
        profileImage: borrower.name.split(' ').map(n => n[0]).join(''),
        amount: 2000,
        duration: 14,
        compatibility: 85,
      }));
    }),

  // Subscription for loan updates
  onLoanUpdate: publicProcedure.subscription(({ ctx }) => {
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
  })
});