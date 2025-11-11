import { router, publicProcedure, ee } from '../trpc';
import { observable } from '@trpc/server/observable';
import { LoanUpdate } from '../types';
import { prisma } from '../types';

export const borrowerRouter = router({
  getProfile: publicProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({ where: { id: ctx.userId } });
    if (!user) throw new Error('User not found');

    return {
      id: user.id,
      name: user.name,
      collegeName: user.collegeName,
      collegeYear: user.collegeYear,
      creditScore: user.creditScore,
      trustBadge: user.trustBadge ? "verified" : "unverified",
      currentBalance: `₹${user.currentBalance}`,
      reputation: user.reputation,
      emergencyCreditAvailable: `₹${user.emergencyCreditAvailable}`
    };
  }),

  getLenders: publicProcedure.query(async () => {
    const lenders = await prisma.user.findMany();
    return lenders.map(lender => ({
      id: lender.id,
      name: lender.name,
      collegeName: lender.collegeName,
      collegeYear: lender.collegeYear,
      branch: "CSE", // Mock
      matchPercentage: 85 + Math.floor(Math.random() * 15), // Mock
      riskTolerance: "Medium", // Mock
      interestRate: "8%", // Mock
      trustBadge: lender.trustBadge,
      profileImage: lender.name.split(' ').map(n => n[0]).join('')
    }));
  }),

  getActiveLoans: publicProcedure.query(async ({ ctx }) => {
    const loans = await prisma.loan.findMany({
      where: { borrowerId: ctx.userId },
      include: { lender: true }
    });
    return loans.map(loan => ({
      id: loan.id,
      lenderName: loan.lender?.name || 'Unknown',
      amount: `₹${loan.amount}`,
      remaining: `₹${loan.remaining}`,
      interestRate: `${loan.interestRate}%`,
      nextDueDate: loan.nextDueDate.toISOString().split('T')[0],
      status: loan.status,
      progressPercent: loan.progressPercent,
      dueAmount: `₹${loan.dueAmount}`
    }));
  }),

  requestLoan: publicProcedure
    .input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'lenderId' in val && 'amount' in val) {
        return val as { lenderId: number; amount: number };
      }
      throw new Error('Invalid input');
    })
    .mutation(async ({ input, ctx }) => {
      const lender = await prisma.user.findUnique({ where: { id: input.lenderId } });
      if (!lender) throw new Error('Lender not found');

      const loan = await prisma.loan.create({
        data: {
          borrowerId: ctx.userId,
          lenderId: input.lenderId,
          amount: input.amount,
          remaining: input.amount,
          interestRate: 7, // Mock
          status: 'active',
          loanType: 'personal', // Default
          nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          progressPercent: 0,
          dueAmount: Math.round(input.amount / 12)
        }
      });

      // Emit event for subscriptions
      ee.emit('loanUpdate', {
        userId: ctx.userId,
        type: 'newLoan' as const,
        loan: loan
      });

      return { success: true, message: `Loan requested from ${lender.name}`, loanId: loan.id };
    }),

  makePayment: publicProcedure
    .input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'loanId' in val && 'amount' in val) {
        return val as { loanId: number; amount: number };
      }
      throw new Error('Invalid input');
    })
    .mutation(async ({ input, ctx }) => {
      const loan = await prisma.loan.findFirst({
        where: { id: input.loanId, borrowerId: ctx.userId }
      });
      if (!loan) throw new Error('Loan not found');

      const updatedLoan = await prisma.loan.update({
        where: { id: input.loanId },
        data: {
          remaining: Math.max(0, loan.remaining - input.amount),
          progressPercent: Math.round(((loan.amount - (loan.remaining - input.amount)) / loan.amount) * 100),
          status: loan.remaining - input.amount <= 0 ? 'completed' : loan.status
        }
      });

      // Emit event
      ee.emit('loanUpdate', {
        userId: ctx.userId,
        type: 'payment' as const,
        loan: updatedLoan
      });

      return { success: true, message: `Payment of ₹${input.amount} made for loan ${input.loanId}`, remaining: updatedLoan.remaining };
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
